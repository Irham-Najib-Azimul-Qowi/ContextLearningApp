export type AdminRole = "SUPER_ADMIN" | "SYSTEM_ADMIN" | "CONTENT_ADMIN";

export type AdminPermission =
  | "users.read"
  | "users.manage"
  | "schools.manage"
  | "ai.credentials.manage"
  | "ai.models.manage"
  | "ai.usage.read"
  | "ai.failover.manage"
  | "knowledge.read"
  | "knowledge.manage"
  | "knowledge.review"
  | "media.manage"
  | "system.health.read"
  | "system.settings.manage"
  | "security.audit.read"
  | "admins.manage";

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    "users.read",
    "users.manage",
    "schools.manage",
    "ai.credentials.manage",
    "ai.models.manage",
    "ai.usage.read",
    "ai.failover.manage",
    "knowledge.read",
    "knowledge.manage",
    "knowledge.review",
    "media.manage",
    "system.health.read",
    "system.settings.manage",
    "security.audit.read",
    "admins.manage",
  ],
  SYSTEM_ADMIN: [
    "users.read",
    "users.manage",
    "schools.manage",
    "ai.usage.read",
    "system.health.read",
    "system.settings.manage",
    "security.audit.read",
  ],
  CONTENT_ADMIN: [
    "knowledge.read",
    "knowledge.manage",
    "knowledge.review",
    "media.manage",
    "ai.usage.read",
    "system.health.read",
  ],
};

export interface AdminAccount {
  id: string;
  username: string;
  password_hash: string;
  salt: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  failed_login_attempts: number;
  locked_until?: string | null;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminSession {
  id: string;
  admin_id: string;
  session_token_hash: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: string;
  created_at: string;
}

export interface AICredential {
  id: string;
  name: string;
  provider: "gemini" | "openai" | "anthropic";
  quota_group: string; // e.g. "default_project" or "tier2_project"
  encrypted_api_key: string;
  iv: string;
  auth_tag: string;
  masked_key: string;
  priority: number;
  is_enabled: boolean;
  health_status: "healthy" | "degraded" | "rate_limited" | "invalid" | "disabled";
  consecutive_errors: number;
  circuit_state: "CLOSED" | "OPEN" | "HALF_OPEN";
  circuit_opened_at?: string | null;
  cooldown_seconds: number;
  daily_request_limit: number;
  last_used_at?: string | null;
  last_error?: string | null;
  last_error_at?: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type AICapability =
  | "text_generation"
  | "structured_output"
  | "image_understanding"
  | "image_generation"
  | "long_context";

export interface AIModelConfig {
  id: string;
  feature_key:
    | "question_generation"
    | "question_scan"
    | "material_generation"
    | "contextual_rewriting"
    | "educational_validation";
  provider: string;
  primary_model: string;
  fallback_model: string;
  required_capabilities: AICapability[];
  timeout_ms: number;
  temperature: number;
  max_output_tokens: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AIErrorClassification =
  | "AUTHENTICATION_ERROR"
  | "INVALID_API_KEY"
  | "PERMISSION_DENIED"
  | "RATE_LIMITED"
  | "QUOTA_EXCEEDED"
  | "MODEL_UNAVAILABLE"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "INVALID_REQUEST"
  | "CONTEXT_TOO_LARGE"
  | "SAFETY_REJECTION"
  | "INVALID_STRUCTURED_OUTPUT"
  | "UNKNOWN_ERROR";

export interface AIUsageEvent {
  id: string;
  credential_id?: string;
  credential_name?: string;
  quota_group?: string;
  feature_key: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  latency_ms: number;
  status: "SUCCESS" | "RATE_LIMITED" | "QUOTA_EXCEEDED" | "ERROR" | "FAILED_OVER";
  error_type?: AIErrorClassification;
  error_message?: string;
  caller_user_id?: string;
  created_at: string;
}

export interface AIFailoverEvent {
  id: string;
  trigger_credential_id?: string;
  target_credential_id?: string;
  feature_key: string;
  error_classification: AIErrorClassification;
  reason: string;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id?: string;
  admin_username: string;
  action: string;
  target_type: "USER" | "SCHOOL" | "CREDENTIAL" | "MODEL" | "KNOWLEDGE_ENTITY" | "SETTING" | "ADMIN";
  target_id?: string;
  result: "SUCCESS" | "FAILED" | "BLOCKED";
  metadata: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface SystemSetting {
  key: string;
  value: Record<string, unknown>;
  description?: string;
  updated_by?: string;
  updated_at: string;
}

export interface SystemNotification {
  id: string;
  type: "INFO" | "WARNING" | "ALERT";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SystemHealthStatus {
  status: "Operational" | "Degraded" | "Unavailable" | "Unknown";
  checked_at: string;
  components: {
    nextjs_serverless: "Operational" | "Degraded" | "Unavailable";
    database_postgres: "Operational" | "Degraded" | "Unavailable";
    pgvector_extension: "Operational" | "Degraded" | "Unavailable";
    gemini_primary_api: "Operational" | "Degraded" | "Unavailable";
    local_knowledge_base: "Operational" | "Degraded" | "Unavailable";
    storage_supabase: "Operational" | "Degraded" | "Unavailable";
  };
  metrics: {
    active_credentials_count: number;
    healthy_credentials_count: number;
    daily_tokens_consumed: number;
    error_rate_percentage: number;
  };
}
