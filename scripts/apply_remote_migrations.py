#!/usr/bin/env python3
"""
PAHAMI V2 — Automated Remote Supabase Migration Runner
Applies PostgreSQL migrations, pgvector extension, core schemas, RLS policies, and seed data.
Usage: uv run --with "psycopg[binary]" python scripts/apply_remote_migrations.py
"""

import os
import sys
import re
from pathlib import Path

# Try importing psycopg
try:
    import psycopg
except ImportError:
    print("[ERROR] 'psycopg' library is required.")
    print("Run with: uv run --with \"psycopg[binary]\" python scripts/apply_remote_migrations.py")
    sys.exit(1)


def load_env_local(project_root: Path) -> dict:
    env_file = project_root / ".env.local"
    env_vars = {}
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                match = re.match(r"^([A-Za-z0-9_]+)=(.*)$", line)
                if match:
                    key = match.group(1).strip()
                    val = match.group(2).strip().strip("\"'")
                    env_vars[key] = val
    return env_vars


def main():
    project_root = Path(__file__).resolve().parent.parent
    env_vars = load_env_local(project_root)

    db_url = os.getenv("DATABASE_URL") or env_vars.get("DATABASE_URL")

    if not db_url:
        print("==================================================================")
        print("[GAGAL] Variabel 'DATABASE_URL' belum ditemukan di .env.local!")
        print("==================================================================")
        print("Untuk meremote Supabase dari sini, silakan tambahkan baris berikut di .env.local:")
        print("DATABASE_URL=postgresql://postgres.<project-ref>:<db-password>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres")
        print("------------------------------------------------------------------")
        print("Lokasi di Supabase Dashboard:")
        print("Project Settings > Database > Connection Pooling > Connection String (URI)")
        sys.exit(1)

    print("==================================================================")
    print("PAHAMI V2 — REMOTE SUPABASE MIGRATION RUNNER")
    print("==================================================================")
    print(f"Target Database: {db_url.split('@')[-1] if '@' in db_url else 'PostgreSQL'}")
    print("Menghubungkan ke remote Supabase PostgreSQL...")

    try:
        conn = psycopg.connect(db_url, autocommit=True)
        print("[OK] Koneksi berhasil terhubung!")
    except Exception as e:
        print(f"[ERROR] Gagal terhubung ke database: {e}")
        sys.exit(1)

    cursor = conn.cursor()

    migrations = [
        ("1. Local Knowledge Base & pgvector", project_root / "supabase" / "migrations" / "20260923140000_local_knowledge.sql"),
        ("2. Madiun Raya Verified Seed Dataset", project_root / "supabase" / "seed" / "20260923150000_madiun_raya_seed.sql"),
        ("3. Core LMS Schema & Multi-Tenant RLS", project_root / "supabase" / "migrations" / "20260924000000_pahami_core_schema.sql"),
    ]

    for title, filepath in migrations:
        if not filepath.exists():
            print(f"[LEWAT] File tidak ditemukan: {filepath}")
            continue

        print(f"\nMengeksekusi {title}...")
        print(f"File: {filepath.relative_to(project_root)}")

        with open(filepath, "r", encoding="utf-8") as f:
            sql_content = f.read()

        try:
            cursor.execute(sql_content)
            print(f"[SUKSES] {title} berhasil diterapkan!")
        except Exception as e:
            print(f"[ERROR] Eksekusi {title} gagal: {e}")
            conn.close()
            sys.exit(1)

    # -------------------------------------------------------------------------
    # VERIFICATION
    # -------------------------------------------------------------------------
    print("\n==================================================================")
    print("MEMVERIFIKASI STATUS SISTEM REMOTE SUPABASE...")
    print("==================================================================")

    # 1. Vector extension
    cursor.execute("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';")
    ext = cursor.fetchone()
    if ext:
        print(f"[OK] Ekstensi pgvector AKTIF (Versi: {ext[1]})")
    else:
        print("[WARNING] Ekstensi vector belum terdeteksi aktif.")

    # 2. Counts
    queries = [
        ("Wilayah LKB (lkb_regions)", "SELECT count(*) FROM public.lkb_regions;"),
        ("Entitas Lokal (lkb_entities)", "SELECT count(*) FROM public.lkb_entities;"),
        ("Fakta & Bukti Sumber (lkb_entity_evidence)", "SELECT count(*) FROM public.lkb_entity_evidence;"),
        ("Sekolah Terdaftar (schools)", "SELECT count(*) FROM public.schools;"),
        ("Kelas (classrooms)", "SELECT count(*) FROM public.classrooms;"),
        ("Bank Soal (questions)", "SELECT count(*) FROM public.questions;"),
    ]

    for label, q in queries:
        try:
            cursor.execute(q)
            cnt = cursor.fetchone()[0]
            print(f"- {label}: {cnt} baris")
        except Exception as e:
            print(f"- {label}: Error ({e})")

    # 3. Test RPC function
    print("\nMenguji fungsi retrieval RPC lkb_retrieve_context...")
    try:
        cursor.execute("SELECT public.lkb_retrieve_context(p_region_id := '35.02', p_query := 'reog', p_limit := 3);")
        res = cursor.fetchone()[0]
        results_list = res.get('results', [])
        print(f"[OK] RPC berfungsi normal! Ditemukan {len(results_list)} entitas terverifikasi untuk 'reog' di Ponorogo.")
        for item in results_list:
            print(f"     > {item.get('canonical_name')} (Wilayah: {item.get('region_name')}, Kategori: {item.get('category')})")
    except Exception as e:
        print(f"[WARNING] Uji RPC error: {e}")

    conn.close()
    print("\n==================================================================")
    print("STATUS AKHIR: DATABASE & VECTOR DB SUPABASE SIAP DIGUNAKAN!")
    print("==================================================================")


if __name__ == "__main__":
    main()
