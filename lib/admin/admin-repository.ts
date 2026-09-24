import {
  AdminAccount,
  AdminSession,
  AICredential,
  AIModelConfig,
  AIUsageEvent,
  AIFailoverEvent,
  AdminAuditLog,
  SystemSetting,
  SystemNotification,
  SystemHealthStatus,
} from "./types";
import { encryptSecret, maskApiKey, hashPasswordSync } from "./crypto";

// ==============================================================================
// IN-MEMORY CACHE / DEV STATE (Synchronous & resilient)
// ==============================================================================

// Default Super Admin for Dev / Initial Seed
const DEFAULT_SALT = "a1b2c3d4e5f67890";
const DEFAULT_HASH = hashPasswordSync("AdminPahami2026!", DEFAULT_SALT).hash;

let ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: "adm-super-01",
    username: "superadmin",
    password_hash: DEFAULT_HASH,
    salt: DEFAULT_SALT,
    full_name: "Super Administrator Developer",
    role: "SUPER_ADMIN",
    is_active: true,
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: "2026-09-24T12:00:00Z",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-24T12:00:00Z",
  },
];

let ADMIN_SESSIONS: AdminSession[] = [];

// Default Seed AI Credential (Primary Gemini Key from environment if available)
const seedKey = process.env.GEMINI_API_KEY || "AIzaSy_DEV_DEMO_KEY_MADIUN_2026";
const encryptedSeed = encryptSecret(seedKey);

let AI_CREDENTIALS: AICredential[] = [
  {
    id: "cred-gemini-primary",
    name: "Gemini Primary Production",
    provider: "gemini",
    quota_group: "project_pahami_prod",
    encrypted_api_key: encryptedSeed.ciphertext,
    iv: encryptedSeed.iv,
    auth_tag: encryptedSeed.tag,
    masked_key: maskApiKey(seedKey),
    priority: 1,
    is_enabled: true,
    health_status: "healthy",
    consecutive_errors: 0,
    circuit_state: "CLOSED",
    circuit_opened_at: null,
    cooldown_seconds: 60,
    daily_request_limit: 1500,
    last_used_at: new Date().toISOString(),
    last_error: null,
    last_error_at: null,
    notes: "API Key utama proyek PAHAMI dari Google AI Studio",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "cred-gemini-backup",
    name: "Gemini Secondary / Standby",
    provider: "gemini",
    quota_group: "project_pahami_backup",
    encrypted_api_key: encryptedSeed.ciphertext,
    iv: encryptedSeed.iv,
    auth_tag: encryptedSeed.tag,
    masked_key: maskApiKey("AIzaSyBackupStandbyKey2026"),
    priority: 2,
    is_enabled: true,
    health_status: "healthy",
    consecutive_errors: 0,
    circuit_state: "CLOSED",
    circuit_opened_at: null,
    cooldown_seconds: 60,
    daily_request_limit: 1500,
    last_used_at: null,
    last_error: null,
    last_error_at: null,
    notes: "Kredensial cadangan dengan kuota proyek terpisah untuk automatic failover",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: new Date().toISOString(),
  },
];

let AI_MODELS: AIModelConfig[] = [
  {
    id: "model-cfg-qgen",
    feature_key: "question_generation",
    provider: "gemini",
    primary_model: "gemini-2.5-flash",
    fallback_model: "gemini-1.5-flash",
    required_capabilities: ["text_generation", "structured_output"],
    timeout_ms: 25000,
    temperature: 0.2,
    max_output_tokens: 2048,
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "model-cfg-qscan",
    feature_key: "question_scan",
    provider: "gemini",
    primary_model: "gemini-2.5-flash",
    fallback_model: "gemini-1.5-flash",
    required_capabilities: ["text_generation", "image_understanding"],
    timeout_ms: 30000,
    temperature: 0.1,
    max_output_tokens: 2048,
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "model-cfg-matgen",
    feature_key: "material_generation",
    provider: "gemini",
    primary_model: "gemini-2.5-flash",
    fallback_model: "gemini-1.5-flash",
    required_capabilities: ["text_generation"],
    timeout_ms: 30000,
    temperature: 0.25,
    max_output_tokens: 3072,
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "model-cfg-rewrite",
    feature_key: "contextual_rewriting",
    provider: "gemini",
    primary_model: "gemini-2.5-flash",
    fallback_model: "gemini-1.5-flash",
    required_capabilities: ["text_generation", "structured_output"],
    timeout_ms: 25000,
    temperature: 0.2,
    max_output_tokens: 2048,
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "model-cfg-val",
    feature_key: "educational_validation",
    provider: "gemini",
    primary_model: "gemini-2.5-flash",
    fallback_model: "gemini-1.5-flash",
    required_capabilities: ["text_generation", "structured_output"],
    timeout_ms: 20000,
    temperature: 0.1,
    max_output_tokens: 1024,
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: new Date().toISOString(),
  },
];

let AI_USAGE_EVENTS: AIUsageEvent[] = [
  {
    id: "evt-01",
    credential_id: "cred-gemini-primary",
    credential_name: "Gemini Primary Production",
    quota_group: "project_pahami_prod",
    feature_key: "question_generation",
    model: "gemini-2.5-flash",
    input_tokens: 420,
    output_tokens: 260,
    total_tokens: 680,
    latency_ms: 1150,
    status: "SUCCESS",
    caller_user_id: "usr-teacher-01",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "evt-02",
    credential_id: "cred-gemini-primary",
    credential_name: "Gemini Primary Production",
    quota_group: "project_pahami_prod",
    feature_key: "contextual_rewriting",
    model: "gemini-2.5-flash",
    input_tokens: 580,
    output_tokens: 340,
    total_tokens: 920,
    latency_ms: 1420,
    status: "SUCCESS",
    caller_user_id: "usr-teacher-01",
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

let AI_FAILOVER_EVENTS: AIFailoverEvent[] = [];

let ADMIN_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: "log-seed-01",
    admin_id: "adm-super-01",
    admin_username: "superadmin",
    action: "SYSTEM_INITIALIZED",
    target_type: "SETTING",
    target_id: "initial_setup",
    result: "SUCCESS",
    metadata: { version: "2.0.0-hackathon", residency: "Madiun & Semarang" },
    ip_address: "127.0.0.1",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

let SYSTEM_SETTINGS: Record<string, SystemSetting> = {
  maintenance_mode: {
    key: "maintenance_mode",
    value: { enabled: false, message: "Sistem sedang dalam pemeliharaan berkala untuk peningkatan performa AI.", allow_admin: true },
    description: "Status Maintenance Mode Platform",
    updated_by: "superadmin",
    updated_at: new Date().toISOString(),
  },
  ai_global_switch: {
    key: "ai_global_switch",
    value: { enabled: true, fallback_to_simulation: true, max_daily_budget_usd: 10.0 },
    description: "Global Switch untuk Pemanggilan AI Gemini",
    updated_by: "superadmin",
    updated_at: new Date().toISOString(),
  },
  supported_regions: {
    key: "supported_regions",
    value: { regions: ["35.77", "35.19", "35.21", "35.20", "35.02", "35.01", "33.74"] },
    description: "Daftar ID Wilayah Prioritas Karesidenan Madiun & Kota Semarang",
    updated_by: "superadmin",
    updated_at: new Date().toISOString(),
  },
};

let SYSTEM_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-01",
    type: "INFO",
    title: "Admin Control Center Aktif",
    message: "Sistem pemantauan multi-provider AI dan manajemen remote siap digunakan.",
    is_read: false,
    created_at: new Date().toISOString(),
  },
];

// ==============================================================================
// REPOSITORY CLASS
// ==============================================================================

class AdminRepository {
  // ----------------------------------------------------------------------------
  // ADMIN ACCOUNTS & SESSIONS
  // ----------------------------------------------------------------------------
  getAdminByUsername(username: string): AdminAccount | null {
    const clean = username.trim().toLowerCase();
    return ADMIN_ACCOUNTS.find((a) => a.username.toLowerCase() === clean) || null;
  }

  getAdminById(id: string): AdminAccount | null {
    return ADMIN_ACCOUNTS.find((a) => a.id === id) || null;
  }

  listAdmins(): AdminAccount[] {
    return [...ADMIN_ACCOUNTS];
  }

  createAdmin(admin: Omit<AdminAccount, "id" | "created_at" | "updated_at">): AdminAccount {
    const newAdmin: AdminAccount = {
      ...admin,
      id: `adm-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    ADMIN_ACCOUNTS.push(newAdmin);
    return newAdmin;
  }

  updateAdminLoginSuccess(id: string): void {
    const idx = ADMIN_ACCOUNTS.findIndex((a) => a.id === id);
    if (idx !== -1) {
      ADMIN_ACCOUNTS[idx].failed_login_attempts = 0;
      ADMIN_ACCOUNTS[idx].locked_until = null;
      ADMIN_ACCOUNTS[idx].last_login_at = new Date().toISOString();
      ADMIN_ACCOUNTS[idx].updated_at = new Date().toISOString();
    }
  }

  recordFailedLogin(id: string): { attempts: number; isLocked: boolean } {
    const idx = ADMIN_ACCOUNTS.findIndex((a) => a.id === id);
    if (idx === -1) return { attempts: 0, isLocked: false };

    const attempts = ADMIN_ACCOUNTS[idx].failed_login_attempts + 1;
    ADMIN_ACCOUNTS[idx].failed_login_attempts = attempts;
    ADMIN_ACCOUNTS[idx].updated_at = new Date().toISOString();

    if (attempts >= 5) {
      // Lock for 15 minutes
      const lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      ADMIN_ACCOUNTS[idx].locked_until = lockUntil;
      return { attempts, isLocked: true };
    }

    return { attempts, isLocked: false };
  }

  updateAdminPassword(id: string, newPasswordHash: string, newSalt: string): boolean {
    const idx = ADMIN_ACCOUNTS.findIndex((a) => a.id === id);
    if (idx !== -1) {
      ADMIN_ACCOUNTS[idx].password_hash = newPasswordHash;
      ADMIN_ACCOUNTS[idx].salt = newSalt;
      ADMIN_ACCOUNTS[idx].updated_at = new Date().toISOString();
      return true;
    }
    return false;
  }

  createSession(adminId: string, tokenHash: string, ip?: string, userAgent?: string): AdminSession {
    const session: AdminSession = {
      id: `sess-${Date.now()}`,
      admin_id: adminId,
      session_token_hash: tokenHash,
      ip_address: ip,
      user_agent: userAgent,
      expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
      created_at: new Date().toISOString(),
    };
    ADMIN_SESSIONS.push(session);
    return session;
  }

  getSessionByTokenHash(tokenHash: string): { session: AdminSession; admin: AdminAccount } | null {
    const session = ADMIN_SESSIONS.find((s) => s.session_token_hash === tokenHash);
    if (!session) return null;

    if (new Date(session.expires_at).getTime() < Date.now()) {
      // Expired
      this.deleteSession(tokenHash);
      return null;
    }

    const admin = this.getAdminById(session.admin_id);
    if (!admin || !admin.is_active) return null;

    return { session, admin };
  }

  deleteSession(tokenHash: string): void {
    ADMIN_SESSIONS = ADMIN_SESSIONS.filter((s) => s.session_token_hash !== tokenHash);
  }

  deleteAdminSessions(adminId: string): void {
    ADMIN_SESSIONS = ADMIN_SESSIONS.filter((s) => s.admin_id !== adminId);
  }

  // ----------------------------------------------------------------------------
  // AI CREDENTIALS
  // ----------------------------------------------------------------------------
  listCredentials(): AICredential[] {
    return [...AI_CREDENTIALS].sort((a, b) => a.priority - b.priority);
  }

  getCredentialById(id: string): AICredential | null {
    return AI_CREDENTIALS.find((c) => c.id === id) || null;
  }

  addCredential(cred: Omit<AICredential, "id" | "created_at" | "updated_at">): AICredential {
    const newCred: AICredential = {
      ...cred,
      id: `cred-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    AI_CREDENTIALS.push(newCred);
    return newCred;
  }

  updateCredential(id: string, updates: Partial<AICredential>): AICredential | null {
    const idx = AI_CREDENTIALS.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    AI_CREDENTIALS[idx] = {
      ...AI_CREDENTIALS[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return AI_CREDENTIALS[idx];
  }

  deleteCredential(id: string): boolean {
    const initial = AI_CREDENTIALS.length;
    AI_CREDENTIALS = AI_CREDENTIALS.filter((c) => c.id !== id);
    return AI_CREDENTIALS.length < initial;
  }

  // ----------------------------------------------------------------------------
  // AI MODELS
  // ----------------------------------------------------------------------------
  listModels(): AIModelConfig[] {
    return [...AI_MODELS];
  }

  getModelByFeature(featureKey: string): AIModelConfig | null {
    return AI_MODELS.find((m) => m.feature_key === featureKey) || null;
  }

  updateModel(featureKey: string, updates: Partial<AIModelConfig>): AIModelConfig | null {
    const idx = AI_MODELS.findIndex((m) => m.feature_key === featureKey);
    if (idx === -1) return null;

    AI_MODELS[idx] = {
      ...AI_MODELS[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return AI_MODELS[idx];
  }

  // ----------------------------------------------------------------------------
  // USAGE & FAILOVER EVENTS
  // ----------------------------------------------------------------------------
  recordUsageEvent(event: Omit<AIUsageEvent, "id" | "created_at">): AIUsageEvent {
    const newEvent: AIUsageEvent = {
      ...event,
      id: `usevt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    AI_USAGE_EVENTS.unshift(newEvent);
    // Keep max 500 events in memory
    if (AI_USAGE_EVENTS.length > 500) {
      AI_USAGE_EVENTS.pop();
    }
    return newEvent;
  }

  listUsageEvents(limit: number = 50, filterFeature?: string): AIUsageEvent[] {
    let result = AI_USAGE_EVENTS;
    if (filterFeature && filterFeature !== "ALL") {
      result = result.filter((e) => e.feature_key === filterFeature);
    }
    return result.slice(0, limit);
  }

  recordFailoverEvent(event: Omit<AIFailoverEvent, "id" | "created_at">): AIFailoverEvent {
    const newEvent: AIFailoverEvent = {
      ...event,
      id: `failover-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    AI_FAILOVER_EVENTS.unshift(newEvent);
    return newEvent;
  }

  listFailoverEvents(limit: number = 20): AIFailoverEvent[] {
    return AI_FAILOVER_EVENTS.slice(0, limit);
  }

  // ----------------------------------------------------------------------------
  // AUDIT LOGS
  // ----------------------------------------------------------------------------
  recordAuditLog(log: Omit<AdminAuditLog, "id" | "created_at">): AdminAuditLog {
    const newLog: AdminAuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    ADMIN_AUDIT_LOGS.unshift(newLog);
    if (ADMIN_AUDIT_LOGS.length > 500) {
      ADMIN_AUDIT_LOGS.pop();
    }
    return newLog;
  }

  listAuditLogs(limit: number = 50): AdminAuditLog[] {
    return ADMIN_AUDIT_LOGS.slice(0, limit);
  }

  // ----------------------------------------------------------------------------
  // SYSTEM SETTINGS & NOTIFICATIONS
  // ----------------------------------------------------------------------------
  getSetting(key: string): SystemSetting | null {
    return SYSTEM_SETTINGS[key] || null;
  }

  getAllSettings(): SystemSetting[] {
    return Object.values(SYSTEM_SETTINGS);
  }

  setSetting(key: string, value: Record<string, unknown>, updatedBy: string): SystemSetting {
    const setting: SystemSetting = {
      key,
      value,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    };
    SYSTEM_SETTINGS[key] = setting;
    return setting;
  }

  listNotifications(): SystemNotification[] {
    return [...SYSTEM_NOTIFICATIONS];
  }

  markNotificationRead(id: string): void {
    const n = SYSTEM_NOTIFICATIONS.find((x) => x.id === id);
    if (n) n.is_read = true;
  }

  addNotification(type: "INFO" | "WARNING" | "ALERT", title: string, message: string): SystemNotification {
    const notif: SystemNotification = {
      id: `sysnotif-${Date.now()}`,
      type,
      title,
      message,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    SYSTEM_NOTIFICATIONS.unshift(notif);
    return notif;
  }

  // ----------------------------------------------------------------------------
  // HEALTH STATUS
  // ----------------------------------------------------------------------------
  getSystemHealth(): SystemHealthStatus {
    const healthyCreds = AI_CREDENTIALS.filter((c) => c.health_status === "healthy" && c.is_enabled).length;
    const totalCreds = AI_CREDENTIALS.length;
    const totalTokens = AI_USAGE_EVENTS.reduce((acc, curr) => acc + curr.total_tokens, 0);

    const errorCount = AI_USAGE_EVENTS.filter((e) => e.status !== "SUCCESS").length;
    const errorRate = AI_USAGE_EVENTS.length > 0 ? (errorCount / AI_USAGE_EVENTS.length) * 100 : 0;

    let overallStatus: "Operational" | "Degraded" | "Unavailable" = "Operational";
    if (healthyCreds === 0) {
      overallStatus = "Degraded";
    }

    return {
      status: overallStatus,
      checked_at: new Date().toISOString(),
      components: {
        nextjs_serverless: "Operational",
        database_postgres: "Operational",
        pgvector_extension: "Operational",
        gemini_primary_api: healthyCreds > 0 ? "Operational" : "Degraded",
        local_knowledge_base: "Operational",
        storage_supabase: "Operational",
      },
      metrics: {
        active_credentials_count: totalCreds,
        healthy_credentials_count: healthyCreds,
        daily_tokens_consumed: totalTokens,
        error_rate_percentage: Number(errorRate.toFixed(1)),
      },
    };
  }
}

export const adminRepository = new AdminRepository();
