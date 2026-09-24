import { cookies } from "next/headers";
import { adminRepository } from "./admin-repository";
import { verifyPassword, hashPassword, generateSessionToken, hashSessionToken } from "./crypto";
import { AdminAccount, AdminPermission, ROLE_PERMISSIONS } from "./types";

export const ADMIN_COOKIE_NAME = "pahami_admin_session";

export interface LoginResult {
  success: boolean;
  error?: string;
  admin?: {
    id: string;
    username: string;
    full_name: string;
    role: string;
    permissions: AdminPermission[];
  };
  token?: string;
}

/**
 * Server-side Admin authentication via username and password.
 * Implements brute-force lockout, timing-attack resistant password verification, and session creation.
 */
export async function authenticateAdmin(
  username: string,
  password: string,
  ip?: string,
  userAgent?: string
): Promise<LoginResult> {
  const cleanUsername = (username || "").trim();
  if (!cleanUsername || !password) {
    return { success: false, error: "Username dan password wajib diisi." };
  }

  const admin = adminRepository.getAdminByUsername(cleanUsername);
  if (!admin) {
    // Record generic failure without revealing username existence
    adminRepository.recordAuditLog({
      admin_username: cleanUsername,
      action: "ADMIN_LOGIN_FAILED",
      target_type: "ADMIN",
      result: "FAILED",
      metadata: { reason: "Account not found or invalid credentials" },
      ip_address: ip,
    });
    return { success: false, error: "Kredensial Admin tidak valid atau akun dinonaktifkan." };
  }

  // Check if account is active
  if (!admin.is_active) {
    adminRepository.recordAuditLog({
      admin_id: admin.id,
      admin_username: admin.username,
      action: "ADMIN_LOGIN_BLOCKED",
      target_type: "ADMIN",
      target_id: admin.id,
      result: "BLOCKED",
      metadata: { reason: "Account is disabled" },
      ip_address: ip,
    });
    return { success: false, error: "Akun Admin telah dinonaktifkan. Hubungi Super Administrator." };
  }

  // Check brute force lockout
  if (admin.locked_until && new Date(admin.locked_until).getTime() > Date.now()) {
    const minutesLeft = Math.ceil((new Date(admin.locked_until).getTime() - Date.now()) / 60000);
    adminRepository.recordAuditLog({
      admin_id: admin.id,
      admin_username: admin.username,
      action: "ADMIN_LOGIN_LOCKED",
      target_type: "ADMIN",
      target_id: admin.id,
      result: "BLOCKED",
      metadata: { minutesLeft },
      ip_address: ip,
    });
    return {
      success: false,
      error: `Akun terkunci sementara karena beberapa kegagalan login. Coba lagi dalam ${minutesLeft} menit.`,
    };
  }

  // Verify password using scrypt
  const isValid = await verifyPassword(password, admin.password_hash, admin.salt);
  if (!isValid) {
    const { attempts, isLocked } = adminRepository.recordFailedLogin(admin.id);
    adminRepository.recordAuditLog({
      admin_id: admin.id,
      admin_username: admin.username,
      action: "ADMIN_LOGIN_FAILED",
      target_type: "ADMIN",
      target_id: admin.id,
      result: "FAILED",
      metadata: { failed_attempts: attempts, is_locked: isLocked },
      ip_address: ip,
    });

    if (isLocked) {
      return {
        success: false,
        error: "Terlalu banyak percobaan gagal. Akun dikunci sementara selama 15 menit.",
      };
    }

    return {
      success: false,
      error: `Kredensial Admin tidak valid. Sisa percobaan: ${Math.max(0, 5 - attempts)}.`,
    };
  }

  // Authentication succeeded
  adminRepository.updateAdminLoginSuccess(admin.id);

  // Generate cryptographically secure session token
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  adminRepository.createSession(admin.id, tokenHash, ip, userAgent);

  adminRepository.recordAuditLog({
    admin_id: admin.id,
    admin_username: admin.username,
    action: "ADMIN_LOGIN_SUCCESS",
    target_type: "ADMIN",
    target_id: admin.id,
    result: "SUCCESS",
    metadata: { role: admin.role },
    ip_address: ip,
  });

  return {
    success: true,
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      full_name: admin.full_name,
      role: admin.role,
      permissions: ROLE_PERMISSIONS[admin.role] || [],
    },
  };
}

/**
 * Terminate an admin session and revoke credentials.
 */
export async function terminateAdminSession(token: string): Promise<void> {
  if (!token) return;
  const tokenHash = hashSessionToken(token);
  const sessionData = adminRepository.getSessionByTokenHash(tokenHash);

  if (sessionData) {
    adminRepository.deleteSession(tokenHash);
    adminRepository.recordAuditLog({
      admin_id: sessionData.admin.id,
      admin_username: sessionData.admin.username,
      action: "ADMIN_LOGOUT",
      target_type: "ADMIN",
      target_id: sessionData.admin.id,
      result: "SUCCESS",
      metadata: {},
    });
  }
}

/**
 * Server-side session verification from cookies.
 */
export async function getAuthenticatedAdmin(): Promise<{
  admin: AdminAccount;
  permissions: AdminPermission[];
} | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;

    const tokenHash = hashSessionToken(token);
    const sessionData = adminRepository.getSessionByTokenHash(tokenHash);
    if (!sessionData) return null;

    return {
      admin: sessionData.admin,
      permissions: ROLE_PERMISSIONS[sessionData.admin.role] || [],
    };
  } catch {
    return null;
  }
}

/**
 * Verify whether an admin has a specific permission.
 */
export function hasPermission(admin: AdminAccount, permission: AdminPermission): boolean {
  if (admin.role === "SUPER_ADMIN") return true;
  const allowed = ROLE_PERMISSIONS[admin.role] || [];
  return allowed.includes(permission);
}
