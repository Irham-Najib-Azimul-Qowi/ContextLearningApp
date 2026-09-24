#!/usr/bin/env python3
"""
PAHAMI V2 — Super Admin Bootstrap Python Script
Directly inserts or updates a Super Administrator in the remote Supabase PostgreSQL database.
Usage: uv run --with "psycopg[binary]" python scripts/bootstrap_admin.py --username irham_admin --password PahamiMadiun2026!
"""

import os
import sys
import re
import hashlib
import secrets
import argparse
from pathlib import Path

try:
    import psycopg
except ImportError:
    print("[ERROR] 'psycopg' library is required.")
    print("Run with: uv run --with \"psycopg[binary]\" python scripts/bootstrap_admin.py")
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


def hash_password_scrypt(password: str, salt: str = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    # scrypt with N=16384, r=8, p=1, key_length=64 bytes
    derived = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt.encode("utf-8"),
        n=16384,
        r=8,
        p=1,
        maxmem=0,
        dklen=64
    )
    return derived.hex(), salt


def main():
    parser = argparse.ArgumentParser(description="Bootstrap Super Admin for PAHAMI V2")
    parser.add_argument("--username", default="irham_admin", help="Admin username")
    parser.add_argument("--password", default="PahamiMadiun2026!", help="Admin password (min 8 chars, 1 uppercase, 1 digit)")
    parser.add_argument("--name", default="Irham Najib (Super Admin Developer)", help="Admin full name")
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent
    env_vars = load_env_local(project_root)
    db_url = os.getenv("DATABASE_URL") or env_vars.get("DATABASE_URL")

    if not db_url:
        print("[ERROR] DATABASE_URL tidak ditemukan di .env.local!")
        sys.exit(1)

    print("==================================================================")
    print("PAHAMI V2 — REMOTE SUPABASE SUPER ADMIN BOOTSTRAP")
    print("==================================================================")
    print(f"Target Username: {args.username}")
    print(f"Target Name    : {args.name}")

    if len(args.password) < 8 or not any(c.isupper() for c in args.password) or not any(c.isdigit() for c in args.password):
        print("[ERROR] Password minimal 8 karakter, harus mengandung huruf besar dan angka.")
        sys.exit(1)

    pwd_hash, salt = hash_password_scrypt(args.password)

    try:
        conn = psycopg.connect(db_url, autocommit=True)
        cursor = conn.cursor()

        sql = """
        INSERT INTO admin_accounts (username, password_hash, salt, full_name, role, is_active)
        VALUES (%s, %s, %s, %s, 'SUPER_ADMIN', true)
        ON CONFLICT (username) DO UPDATE
        SET password_hash = EXCLUDED.password_hash,
            salt = EXCLUDED.salt,
            full_name = EXCLUDED.full_name,
            role = 'SUPER_ADMIN',
            is_active = true,
            failed_login_attempts = 0,
            locked_until = NULL,
            updated_at = now();
        """
        cursor.execute(sql, (args.username, pwd_hash, salt, args.name))

        # Record audit log
        audit_sql = """
        INSERT INTO admin_audit_logs (admin_username, action, target_type, target_id, result, metadata)
        VALUES (%s, 'SUPER_ADMIN_BOOTSTRAPPED', 'ADMIN', %s, 'SUCCESS', '{"via": "python_cli"}'::jsonb);
        """
        cursor.execute(audit_sql, (args.username, args.username))

        print("[SUKSES] Akun Super Admin berhasil dibuat/diperbarui di remote Supabase!")
        print(f"- Username : {args.username}")
        print(f"- Role     : SUPER_ADMIN")
        print("Silakan login melalui: http://localhost:3000/admin")
        print("==================================================================")
        conn.close()
    except Exception as e:
        print(f"[ERROR] Database execution error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
