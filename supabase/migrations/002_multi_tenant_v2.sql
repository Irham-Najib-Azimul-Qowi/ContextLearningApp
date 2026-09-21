-- ContextLearning V2 Multi-Tenant Database Migration
-- Architecture: Multi-Tenant SaaS with 3 Roles (PLATFORM_ADMIN, TEACHER, STUDENT)
-- Support for SD, SMP, SMA, School Workspaces, Centralized AI Credentials & Audit Logging

-- 1. EXTEND PROFILES FOR 3 ROLES AND CODES
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('platform_admin', 'teacher', 'student'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS student_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS teacher_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS active_school_id UUID,
  ADD COLUMN IF NOT EXISTS grade INT,
  ADD COLUMN IF NOT EXISTS class_id UUID;

-- 2. EXTEND SCHOOLS FOR MULTI-TENANCY & INSTITUTION LEVELS
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS code TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS educational_level TEXT NOT NULL DEFAULT 'SD' CHECK (educational_level IN ('SD', 'SMP', 'SMA')),
  ADD COLUMN IF NOT EXISTS npsn TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (verification_status IN ('pending_verification', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Backfill default codes and slugs for existing rows
UPDATE public.schools
SET code = 'SCH-' || SUBSTRING(id::TEXT, 1, 6)
WHERE code IS NULL;

UPDATE public.schools
SET slug = 'school-' || SUBSTRING(id::TEXT, 1, 8)
WHERE slug IS NULL;

ALTER TABLE public.schools
  ALTER COLUMN code SET NOT NULL,
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_code ON public.schools(code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_slug ON public.schools(slug);

-- 3. SCHOOL MEMBERSHIPS (Multi-school affiliation for teachers)
CREATE TABLE IF NOT EXISTS public.school_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'school_coordinator')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, user_id)
);

-- 4. SCHOOL INVITATIONS
CREATE TABLE IF NOT EXISTS public.school_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  invitation_code TEXT NOT NULL UNIQUE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'school_coordinator')),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ATTACH SCHOOL_ID TO TENANT RESOURCES
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;

ALTER TABLE public.learning_materials
  ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;

ALTER TABLE public.examinations
  ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;

-- 6. CENTRALIZED GEMINI AI CREDENTIALS (Strictly Server-Side)
CREATE TABLE IF NOT EXISTS public.ai_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  api_key_masked TEXT NOT NULL,
  encrypted_key TEXT,
  project_id TEXT,
  supported_models TEXT[] NOT NULL DEFAULT ARRAY['gemini-2.5-flash'],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'rate_limited', 'quota_exhausted')),
  priority INT NOT NULL DEFAULT 1,
  weight INT NOT NULL DEFAULT 100,
  daily_request_count INT NOT NULL DEFAULT 0,
  total_tokens_used BIGINT NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  health_status TEXT NOT NULL DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'degraded', 'failing')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. SCANNED ANSWER SHEETS (Paper-based exam correction)
CREATE TABLE IF NOT EXISTS public.scanned_answer_sheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  examination_id UUID NOT NULL REFERENCES public.examinations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  detected_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  uncertain_answers TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'scanned' CHECK (status IN ('scanned', 'confirmed', 'graded')),
  score NUMERIC(5,2),
  submission_source TEXT NOT NULL DEFAULT 'scanned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. COMPREHENSIVE AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR MULTI-TENANT ISOLATION
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.school_memberships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_memberships_school ON public.school_memberships(school_id, status);
CREATE INDEX IF NOT EXISTS idx_questions_school ON public.questions(school_id);
CREATE INDEX IF NOT EXISTS idx_materials_school ON public.learning_materials(school_id);
CREATE INDEX IF NOT EXISTS idx_examinations_school ON public.examinations(school_id);
CREATE INDEX IF NOT EXISTS idx_scanned_sheets_exam ON public.scanned_answer_sheets(examination_id);
CREATE INDEX IF NOT EXISTS idx_audit_school ON public.audit_logs(school_id, created_at DESC);

-- SECURITY POLICIES (Row Level Security for Multi-Tenancy)
ALTER TABLE public.school_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanned_answer_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- AI Credentials: ONLY accessible by PLATFORM_ADMIN
CREATE POLICY "Only Platform Admin can access AI Credentials"
  ON public.ai_credentials FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'platform_admin'
    )
  );

-- School Memberships: Users see their own memberships, coordinators see school members
CREATE POLICY "Users see own memberships"
  ON public.school_memberships FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Coordinators manage school memberships"
  ON public.school_memberships FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_memberships sm
      WHERE sm.school_id = school_memberships.school_id
      AND sm.user_id = auth.uid()
      AND sm.role = 'school_coordinator'
      AND sm.status = 'active'
    )
  );

-- Audit Logs: Platform admin sees all; School coordinators see school-scoped logs
CREATE POLICY "Admins and coordinators view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'platform_admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.school_memberships sm
      WHERE sm.school_id = audit_logs.school_id
      AND sm.user_id = auth.uid()
      AND sm.role = 'school_coordinator'
      AND sm.status = 'active'
    )
  );
