#!/usr/bin/env tsx
/**
 * PAHAMI V2 — Super Admin Bootstrap CLI Script
 * Creates or resets the initial Super Administrator with scrypt password hashing.
 * Usage: npx tsx scripts/bootstrap_admin.ts --username <user> --password <pass> --name "Full Name"
 */

import crypto from "crypto";
import { hashPasswordSync } from "../lib/admin/crypto";
import { adminRepository } from "../lib/admin/admin-repository";

function parseArgs() {
  const args = process.argv.slice(2);
  const params: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].replace(/^--/, "");
      const val = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : "true";
      params[key] = val;
    }
  }

  return params;
}

function validatePassword(pass: string): { valid: boolean; reason?: string } {
  if (pass.length < 8) {
    return { valid: false, reason: "Password minimal 8 karakter." };
  }
  if (!/[A-Z]/.test(pass)) {
    return { valid: false, reason: "Password harus mengandung minimal 1 huruf besar (A-Z)." };
  }
  if (!/[0-9]/.test(pass)) {
    return { valid: false, reason: "Password harus mengandung minimal 1 angka (0-9)." };
  }
  return { valid: true };
}

async function main() {
  console.log("==================================================================");
  console.log("PAHAMI V2 — SUPER ADMIN BOOTSTRAP WIZARD");
  console.log("==================================================================");

  const args = parseArgs();
  const username = args.username || "irham_admin";
  const password = args.password || "PahamiMadiun2026!";
  const fullName = args.name || "Irham Najib (Super Admin Developer)";

  console.log(`Username Target : ${username}`);
  console.log(`Nama Lengkap    : ${fullName}`);

  const validation = validatePassword(password);
  if (!validation.valid) {
    console.error(`[GAGAL] Password tidak memenuhi standar keamanan: ${validation.reason}`);
    process.exit(1);
  }

  const { hash, salt } = hashPasswordSync(password);

  // Check if admin already exists
  const existing = adminRepository.getAdminByUsername(username);
  if (existing) {
    console.log(`[INFO] Admin '${username}' sudah ada. Memperbarui password dan memastikan role SUPER_ADMIN...`);
    existing.password_hash = hash;
    existing.salt = salt;
    existing.role = "SUPER_ADMIN";
    existing.is_active = true;
    existing.failed_login_attempts = 0;
    existing.locked_until = null;
    existing.updated_at = new Date().toISOString();
  } else {
    console.log(`[INFO] Membuat akun Super Admin baru '${username}'...`);
    adminRepository.createAdmin({
      username,
      password_hash: hash,
      salt,
      full_name: fullName,
      role: "SUPER_ADMIN",
      is_active: true,
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: null,
    });
  }

  adminRepository.recordAuditLog({
    admin_username: username,
    action: "SUPER_ADMIN_BOOTSTRAPPED",
    target_type: "ADMIN",
    target_id: username,
    result: "SUCCESS",
    metadata: { via: "cli_bootstrap", scrypt_n: 16384 },
  });

  console.log("==================================================================");
  console.log("[SUKSES] Akun Super Admin berhasil dikonfigurasi!");
  console.log(`- Username: ${username}`);
  console.log(`- Role    : SUPER_ADMIN (Full Permissions)`);
  console.log(`- Status  : Aktif`);
  console.log("Gunakan kredensial ini untuk login di: http://localhost:3000/admin");
  console.log("==================================================================");
}

main().catch((err) => {
  console.error("[ERROR] Bootstrap gagal:", err);
  process.exit(1);
});
