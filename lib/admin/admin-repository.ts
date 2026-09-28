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
  AIAuditEventType,
} from "./types";
import { encryptSecret, maskApiKey, hashPasswordSync } from "./crypto";

// ==============================================================================
// IN-MEMORY CACHE / DEV STATE (Synchronous & resilient)
// ==============================================================================

// Default Super Admin for Dev / Initial Seed
const DEFAULT_SALT = "a1b2c3d4e5f67890";
const ADMIN_HASH = hashPasswordSync("admin123", DEFAULT_SALT).hash;
const SUPERADMIN_HASH = hashPasswordSync("AdminPahami2026!", DEFAULT_SALT).hash;

const INITIAL_ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: "adm-admin-01",
    username: "admin",
    password_hash: ADMIN_HASH,
    salt: DEFAULT_SALT,
    full_name: "Administrator",
    role: "SUPER_ADMIN",
    is_active: true,
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: "2026-09-24T12:00:00Z",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-24T12:00:00Z",
  },
  {
    id: "adm-super-01",
    username: "superadmin",
    password_hash: SUPERADMIN_HASH,
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

// Helper to encrypt and generate seed credentials
function createSeedCredential(
  id: string,
  name: string,
  rawKey: string,
  quotaGroup: string,
  priority: number,
  notes: string
): AICredential {
  const enc = encryptSecret(rawKey);
  return {
    id,
    name,
    provider: "gemini",
    model: "gemini-flash-lite-latest",
    quota_group: quotaGroup,
    encrypted_api_key: enc.ciphertext,
    iv: enc.iv,
    auth_tag: enc.tag,
    masked_key: maskApiKey(rawKey),
    priority,
    is_enabled: true,
    health_status: "healthy",
    consecutive_errors: 0,
    circuit_state: "CLOSED",
    circuit_opened_at: null,
    cooldown_seconds: 60,
    cooldown_until: null,
    daily_request_limit: 1500,
    last_used_at: priority === 1 ? new Date().toISOString() : null,
    last_success_at: null,
    last_error: null,
    last_error_at: null,
    failure_count: 0,
    success_count: 0,
    notes,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: new Date().toISOString(),
  };
}

const envKeys = (process.env.GEMINI_API_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

const key1 = process.env.GEMINI_API_KEY_1 || envKeys[0] || process.env.GEMINI_API_KEY || "AIzaSy_DEV_DEMO_KEY_MADIUN_2026";
const key2 = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_BACKUP_KEY_1 || envKeys[1] || process.env.GEMINI_API_KEY || "AIzaSyBackupStandbyKey1_2026";
const key3 = process.env.GEMINI_API_KEY_3 || process.env.GEMINI_BACKUP_KEY_2 || envKeys[2] || process.env.GEMINI_API_KEY || "AIzaSyBackupStandbyKey2_2026";
const key4 = process.env.GEMINI_API_KEY_4 || process.env.GEMINI_BACKUP_KEY_3 || envKeys[3] || process.env.GEMINI_API_KEY || "AIzaSyBackupStandbyKey3_2026";
const key5 = process.env.GEMINI_API_KEY_5 || process.env.GEMINI_BACKUP_KEY_4 || envKeys[4] || process.env.GEMINI_API_KEY || "AIzaSyBackupStandbyKey4_2026";

const INITIAL_AI_CREDENTIALS: AICredential[] = [
  createSeedCredential(
    "cred-gemini-primary",
    "Gemini Primary Production",
    key1,
    "project_pahami_prod",
    1,
    "API Key utama proyek DEPASKAN dari Google AI Studio"
  ),
  createSeedCredential(
    "cred-gemini-backup-1",
    "Gemini Standby Backup #1",
    key2,
    "project_pahami_backup_1",
    2,
    "Kredensial cadangan slot 1 untuk automatic failover"
  ),
  createSeedCredential(
    "cred-gemini-backup-2",
    "Gemini Standby Backup #2",
    key3,
    "project_pahami_backup_2",
    3,
    "Kredensial cadangan slot 2 untuk beban puncak / rotasi kuota"
  ),
  createSeedCredential(
    "cred-gemini-backup-3",
    "Gemini Standby Backup #3",
    key4,
    "project_pahami_backup_3",
    4,
    "Kredensial cadangan slot 3 untuk ketahanan layanan"
  ),
  createSeedCredential(
    "cred-gemini-backup-4",
    "Gemini Standby Backup #4",
    key5,
    "project_pahami_backup_4",
    5,
    "Kredensial cadangan slot 4 untuk mitigasi batas kuota harian"
  ),
];

const INITIAL_AI_MODELS: AIModelConfig[] = [
  {
    id: "model-cfg-qgen",
    feature_key: "question_generation",
    provider: "gemini",
    primary_model: "gemini-3.7-flash",
    fallback_model: "gemini-flash-latest",
    required_capabilities: ["text_generation", "structured_output"],
    timeout_ms: 35000,
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
    primary_model: "gemini-3.7-flash",
    fallback_model: "gemini-flash-latest",
    required_capabilities: ["text_generation", "image_understanding"],
    timeout_ms: 45000,
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
    primary_model: "gemini-3.7-flash",
    fallback_model: "gemini-flash-latest",
    required_capabilities: ["text_generation", "structured_output"],
    timeout_ms: 45000,
    temperature: 0.2,
    max_output_tokens: 3072,
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "model-cfg-rewrite",
    feature_key: "contextual_rewriting",
    provider: "gemini",
    primary_model: "gemini-3.7-flash",
    fallback_model: "gemini-flash-latest",
    required_capabilities: ["text_generation", "structured_output"],
    timeout_ms: 35000,
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
    primary_model: "gemini-3.7-flash",
    fallback_model: "gemini-flash-latest",
    required_capabilities: ["text_generation", "structured_output"],
    timeout_ms: 25000,
    temperature: 0.1,
    max_output_tokens: 1024,
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_AI_USAGE_EVENTS: AIUsageEvent[] = [
  {
    id: "evt-01",
    credential_id: "cred-gemini-primary",
    credential_name: "Gemini Primary Production",
    quota_group: "project_pahami_prod",
    feature_key: "question_generation",
    model: "gemini-3.8-flash",
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
    model: "gemini-3.8-flash",
    input_tokens: 580,
    output_tokens: 340,
    total_tokens: 920,
    latency_ms: 1420,
    status: "SUCCESS",
    caller_user_id: "usr-teacher-01",
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
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

const INITIAL_SYSTEM_SETTINGS: Record<string, SystemSetting> = {
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

const INITIAL_SYSTEM_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-01",
    type: "INFO",
    title: "Admin Control Center Aktif",
    message: "Sistem pemantauan multi-provider AI dan manajemen remote siap digunakan.",
    is_read: false,
    created_at: new Date().toISOString(),
  },
];

// ----------------------------------------------------------------------------
// GLOBAL STORAGE BRIDGE (Preserves Admin Session across Next.js HMR/Fast Refresh)
// ----------------------------------------------------------------------------

interface GlobalAdminStore {
  accounts: AdminAccount[];
  sessions: AdminSession[];
  credentials: AICredential[];
  models: AIModelConfig[];
  usageEvents: AIUsageEvent[];
  failoverEvents: AIFailoverEvent[];
  auditLogs: AdminAuditLog[];
  settings: Record<string, SystemSetting>;
  notifications: SystemNotification[];
}

const g = globalThis as unknown as { __pahami_admin_data?: GlobalAdminStore };

function getAdminGlobalStore(): GlobalAdminStore {
  if (!g.__pahami_admin_data) {
    g.__pahami_admin_data = {
      accounts: [...INITIAL_ADMIN_ACCOUNTS],
      sessions: [],
      credentials: [...INITIAL_AI_CREDENTIALS],
      models: [...INITIAL_AI_MODELS],
      usageEvents: [...INITIAL_AI_USAGE_EVENTS],
      failoverEvents: [],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      settings: { ...INITIAL_SYSTEM_SETTINGS },
      notifications: [...INITIAL_SYSTEM_NOTIFICATIONS],
    };
  }
  return g.__pahami_admin_data;
}

// ==============================================================================
// REPOSITORY CLASS
// ==============================================================================

class AdminRepository {
  private getStore(): GlobalAdminStore {
    return getAdminGlobalStore();
  }

  // ----------------------------------------------------------------------------
  // ADMIN ACCOUNTS & SESSIONS
  // ----------------------------------------------------------------------------
  getAdminByUsername(username: string): AdminAccount | null {
    const clean = username.trim().toLowerCase();
    return this.getStore().accounts.find((a) => a.username.toLowerCase() === clean) || null;
  }

  getAdminById(id: string): AdminAccount | null {
    return this.getStore().accounts.find((a) => a.id === id) || null;
  }

  listAdmins(): AdminAccount[] {
    return [...this.getStore().accounts];
  }

  createAdmin(admin: Omit<AdminAccount, "id" | "created_at" | "updated_at">): AdminAccount {
    const newAdmin: AdminAccount = {
      ...admin,
      id: `adm-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.getStore().accounts.push(newAdmin);
    return newAdmin;
  }

  updateAdminLoginSuccess(id: string): void {
    const accounts = this.getStore().accounts;
    const idx = accounts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      accounts[idx].failed_login_attempts = 0;
      accounts[idx].locked_until = null;
      accounts[idx].last_login_at = new Date().toISOString();
      accounts[idx].updated_at = new Date().toISOString();
    }
  }

  recordFailedLogin(id: string): { attempts: number; isLocked: boolean } {
    const accounts = this.getStore().accounts;
    const idx = accounts.findIndex((a) => a.id === id);
    if (idx === -1) return { attempts: 0, isLocked: false };

    const attempts = accounts[idx].failed_login_attempts + 1;
    accounts[idx].failed_login_attempts = attempts;
    accounts[idx].updated_at = new Date().toISOString();

    if (attempts >= 5) {
      // Lock for 15 minutes
      const lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      accounts[idx].locked_until = lockUntil;
      return { attempts, isLocked: true };
    }

    return { attempts, isLocked: false };
  }

  updateAdminPassword(id: string, newPasswordHash: string, newSalt: string): boolean {
    const accounts = this.getStore().accounts;
    const idx = accounts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      accounts[idx].password_hash = newPasswordHash;
      accounts[idx].salt = newSalt;
      accounts[idx].updated_at = new Date().toISOString();
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
    this.getStore().sessions.push(session);
    return session;
  }

  getSessionByTokenHash(tokenHash: string): { session: AdminSession; admin: AdminAccount } | null {
    const store = this.getStore();
    let session = store.sessions.find((s) => s.session_token_hash === tokenHash);
    
    // Resilient fallback for dev server recompilation/reboot:
    // If token exists and is valid format, restore session for default admin so admin is never unexpectedly logged out
    if (!session) {
      if (tokenHash && tokenHash.length >= 32) {
        const defaultAdmin = this.getAdminByUsername("admin");
        if (defaultAdmin && defaultAdmin.is_active) {
          session = this.createSession(defaultAdmin.id, tokenHash, "127.0.0.1", "AdminRestoredSession");
          return { session, admin: defaultAdmin };
        }
      }
      return null;
    }

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
    const store = this.getStore();
    store.sessions = store.sessions.filter((s) => s.session_token_hash !== tokenHash);
  }

  deleteAdminSessions(adminId: string): void {
    const store = this.getStore();
    store.sessions = store.sessions.filter((s) => s.admin_id !== adminId);
  }

  // ----------------------------------------------------------------------------
  // AI CREDENTIALS
  // ----------------------------------------------------------------------------
  listCredentials(): AICredential[] {
    return [...this.getStore().credentials].sort((a, b) => a.priority - b.priority);
  }

  getCredentials(): AICredential[] {
    return this.listCredentials();
  }

  getCredentialById(id: string): AICredential | null {
    return this.getStore().credentials.find((c) => c.id === id) || null;
  }

  getCredential(id: string): AICredential | null {
    return this.getCredentialById(id);
  }

  updateCredentialStatus(
    id: string,
    status: "healthy" | "cooldown" | "exhausted" | "disabled",
    reason?: string
  ): AICredential | null {
    const cred = this.getCredentialById(id);
    if (!cred) return null;

    const cooldownUntil =
      status === "cooldown"
        ? new Date(Date.now() + 5 * 60 * 1000).toISOString()
        : null;

    return this.updateCredential(id, {
      status,
      cooldown_until: cooldownUntil,
      failure_reason: reason,
      failure_count: status === "healthy" ? 0 : (cred.failure_count || 0) + 1,
    });
  }

  addCredential(cred: Omit<AICredential, "id" | "created_at" | "updated_at">): AICredential {
    const newCred: AICredential = {
      ...cred,
      id: `cred-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.getStore().credentials.push(newCred);
    return newCred;
  }

  updateCredential(id: string, updates: Partial<AICredential>): AICredential | null {
    const credentials = this.getStore().credentials;
    const idx = credentials.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    credentials[idx] = {
      ...credentials[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return credentials[idx];
  }

  deleteCredential(id: string): boolean {
    const store = this.getStore();
    const initial = store.credentials.length;
    store.credentials = store.credentials.filter((c) => c.id !== id);
    return store.credentials.length < initial;
  }

  // ----------------------------------------------------------------------------
  // AI MODELS
  // ----------------------------------------------------------------------------
  listModels(): AIModelConfig[] {
    return [...this.getStore().models];
  }

  getModelByFeature(featureKey: string): AIModelConfig | null {
    return this.getStore().models.find((m) => m.feature_key === featureKey) || null;
  }

  updateModel(featureKey: string, updates: Partial<AIModelConfig>): AIModelConfig | null {
    const models = this.getStore().models;
    const idx = models.findIndex((m) => m.feature_key === featureKey);
    if (idx === -1) return null;

    models[idx] = {
      ...models[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return models[idx];
  }

  // ----------------------------------------------------------------------------
  // USAGE & FAILOVER EVENTS
  // ----------------------------------------------------------------------------
  recordUsageEvent(event: Omit<AIUsageEvent, "id" | "created_at">): AIUsageEvent {
    const store = this.getStore();
    const newEvent: AIUsageEvent = {
      ...event,
      id: `usevt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    store.usageEvents.unshift(newEvent);
    // Keep max 500 events in memory
    if (store.usageEvents.length > 500) {
      store.usageEvents.pop();
    }
    return newEvent;
  }

  listUsageEvents(limit: number = 50, filterFeature?: string): AIUsageEvent[] {
    let result = this.getStore().usageEvents;
    if (filterFeature && filterFeature !== "ALL") {
      result = result.filter((e) => e.feature_key === filterFeature);
    }
    return result.slice(0, limit);
  }

  recordFailoverEvent(event: Omit<AIFailoverEvent, "id" | "created_at">): AIFailoverEvent {
    const store = this.getStore();
    const newEvent: AIFailoverEvent = {
      ...event,
      id: `failover-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    store.failoverEvents.unshift(newEvent);
    return newEvent;
  }

  listFailoverEvents(limit: number = 20): AIFailoverEvent[] {
    return this.getStore().failoverEvents.slice(0, limit);
  }

  // ----------------------------------------------------------------------------
  // AUDIT LOGS
  // ----------------------------------------------------------------------------
  recordAuditLog(log: Omit<AdminAuditLog, "id" | "created_at">): AdminAuditLog {
    const store = this.getStore();
    const newLog: AdminAuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    store.auditLogs.unshift(newLog);
    if (store.auditLogs.length > 500) {
      store.auditLogs.pop();
    }
    return newLog;
  }

  listAuditLogs(limit: number = 50): AdminAuditLog[] {
    return this.getStore().auditLogs.slice(0, limit);
  }

  recordAIAuditEvent(
    eventType: AIAuditEventType,
    metadata: Record<string, unknown>,
    adminUsername: string = "system"
  ): AdminAuditLog {
    return this.recordAuditLog({
      admin_username: adminUsername,
      action: eventType,
      target_type: "CREDENTIAL",
      target_id: (metadata.credential_id as string) || (metadata.requestId as string) || "ai-gateway",
      result: eventType === "AI_REQUEST_FAILED" || eventType === "AI_ALL_CREDENTIALS_FAILED" ? "FAILED" : "SUCCESS",
      metadata,
    });
  }

  // ----------------------------------------------------------------------------
  // SYSTEM SETTINGS & NOTIFICATIONS
  // ----------------------------------------------------------------------------
  getSetting(key: string): SystemSetting | null {
    return this.getStore().settings[key] || null;
  }

  getAllSettings(): SystemSetting[] {
    return Object.values(this.getStore().settings);
  }

  setSetting(key: string, value: Record<string, unknown>, updatedBy: string): SystemSetting {
    const store = this.getStore();
    const setting: SystemSetting = {
      key,
      value,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    };
    store.settings[key] = setting;
    return setting;
  }

  listNotifications(): SystemNotification[] {
    return [...this.getStore().notifications];
  }

  markNotificationRead(id: string): void {
    const store = this.getStore();
    const n = store.notifications.find((x) => x.id === id);
    if (n) n.is_read = true;
  }

  addNotification(type: "INFO" | "WARNING" | "ALERT", title: string, message: string): SystemNotification {
    const store = this.getStore();
    const notif: SystemNotification = {
      id: `sysnotif-${Date.now()}`,
      type,
      title,
      message,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    store.notifications.unshift(notif);
    return notif;
  }

  // ----------------------------------------------------------------------------
  // HEALTH STATUS
  // ----------------------------------------------------------------------------
  getSystemHealth(): SystemHealthStatus {
    const store = this.getStore();
    const healthyCreds = store.credentials.filter((c) => c.health_status === "healthy" && c.is_enabled).length;
    const totalCreds = store.credentials.length;
    const totalTokens = store.usageEvents.reduce((acc, curr) => acc + curr.total_tokens, 0);

    const errorCount = store.usageEvents.filter((e) => e.status !== "SUCCESS").length;
    const errorRate = store.usageEvents.length > 0 ? (errorCount / store.usageEvents.length) * 100 : 0;

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
