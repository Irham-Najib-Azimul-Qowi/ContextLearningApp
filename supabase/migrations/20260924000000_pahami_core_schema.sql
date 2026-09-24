-- ==============================================================================
-- PAHAMI V2 — CORE APPLICATION SCHEMA & ROW LEVEL SECURITY (RLS)
-- Migration: 20260924000000_pahami_core_schema.sql
-- Modules: Multi-School, User Profiles, Classes, Questions, Materials, Exams, Grading, Notifications
-- ==============================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. SCHOOLS (Multi-Tenant Organization)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schools (
    id TEXT PRIMARY KEY DEFAULT ('sch-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    region_id TEXT NOT NULL REFERENCES public.lkb_regions(region_id),
    region_name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for region lookup
CREATE INDEX IF NOT EXISTS idx_schools_region ON public.schools(region_id);
CREATE INDEX IF NOT EXISTS idx_schools_slug ON public.schools(slug);

-- ------------------------------------------------------------------------------
-- 2. USER PROFILES (Supabase Auth Extension)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('TEACHER', 'STUDENT')),
    avatar_url TEXT,
    school_id TEXT REFERENCES public.schools(id) ON DELETE SET NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_school ON public.user_profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- ------------------------------------------------------------------------------
-- 3. CLASSROOMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classrooms (
    id TEXT PRIMARY KEY DEFAULT ('cls-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
    name TEXT NOT NULL,
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 6),
    school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2025/2026',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classrooms_school ON public.classrooms(school_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON public.classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_code ON public.classrooms(code);

-- ------------------------------------------------------------------------------
-- 4. CLASS MEMBERSHIPS (Student Enrollment)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.class_memberships (
    id TEXT PRIMARY KEY DEFAULT ('mem-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
    class_id TEXT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_class ON public.class_memberships(class_id);
CREATE INDEX IF NOT EXISTS idx_memberships_student ON public.class_memberships(student_id);

-- ------------------------------------------------------------------------------
-- 5. QUESTIONS (Question Bank & Contextual AI)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY DEFAULT ('q-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
    school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL CHECK (subject IN ('Matematika', 'Bahasa Indonesia', 'IPS')),
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 6),
    topic TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'essay')),
    question_text TEXT NOT NULL,
    options JSONB, -- Array of { key: "A"|"B"|"C"|"D", text: string }
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    rubric TEXT,
    is_contextualized BOOLEAN NOT NULL DEFAULT false,
    original_question_text TEXT,
    context_variables JSONB, -- Array of QuestionContextVariable
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_school_subject ON public.questions(school_id, subject);
CREATE INDEX IF NOT EXISTS idx_questions_grade ON public.questions(grade);
CREATE INDEX IF NOT EXISTS idx_questions_context ON public.questions(is_contextualized);

-- ------------------------------------------------------------------------------
-- 6. LEARNING MATERIALS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_materials (
    id TEXT PRIMARY KEY DEFAULT ('mat-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
    school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 6),
    content TEXT NOT NULL,
    is_contextualized BOOLEAN NOT NULL DEFAULT false,
    original_content TEXT,
    published_to_classes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_materials_school ON public.learning_materials(school_id);
CREATE INDEX IF NOT EXISTS idx_materials_grade_subject ON public.learning_materials(grade, subject);

-- ------------------------------------------------------------------------------
-- 7. EXAMINATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exams (
    id TEXT PRIMARY KEY DEFAULT ('exam-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
    title TEXT NOT NULL,
    school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id TEXT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    teacher_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_time TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'completed')),
    question_ids TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exams_school ON public.exams(school_id);
CREATE INDEX IF NOT EXISTS idx_exams_class ON public.exams(class_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON public.exams(status);

-- ------------------------------------------------------------------------------
-- 8. EXAM ATTEMPTS & GRADING
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_attempts (
    id TEXT PRIMARY KEY DEFAULT ('att-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
    exam_id TEXT NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    score NUMERIC(5,2),
    max_score NUMERIC(5,2) NOT NULL DEFAULT 100,
    mc_score NUMERIC(5,2),
    essay_score NUMERIC(5,2),
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_at TIMESTAMPTZ,
    teacher_feedback TEXT,
    UNIQUE(exam_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_attempts_exam ON public.exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON public.exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON public.exam_attempts(status);

-- ------------------------------------------------------------------------------
-- 9. NOTIFICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT ('notif-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Schools: Anyone authenticated can read registered schools
DROP POLICY IF EXISTS "Schools are viewable by authenticated users" ON public.schools;
CREATE POLICY "Schools are viewable by authenticated users"
    ON public.schools FOR SELECT
    TO authenticated
    USING (true);

-- User Profiles:
DROP POLICY IF EXISTS "Users can read relevant profiles" ON public.user_profiles;
CREATE POLICY "Users can read relevant profiles"
    ON public.user_profiles FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() OR
        school_id IN (SELECT school_id FROM public.user_profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
    ON public.user_profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own initial profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own initial profile"
    ON public.user_profiles FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Classrooms:
DROP POLICY IF EXISTS "Teachers can manage classrooms" ON public.classrooms;
CREATE POLICY "Teachers can manage classrooms"
    ON public.classrooms FOR ALL
    TO authenticated
    USING (teacher_id = auth.uid())
    WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Students can read their enrolled classrooms" ON public.classrooms;
CREATE POLICY "Students can read their enrolled classrooms"
    ON public.classrooms FOR SELECT
    TO authenticated
    USING (
        id IN (SELECT class_id FROM public.class_memberships WHERE student_id = auth.uid())
    );

-- Class Memberships:
DROP POLICY IF EXISTS "Students can enroll via class code" ON public.class_memberships;
CREATE POLICY "Students can enroll via class code"
    ON public.class_memberships FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can view memberships of their classes" ON public.class_memberships;
CREATE POLICY "Users can view memberships of their classes"
    ON public.class_memberships FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid() OR
        class_id IN (SELECT id FROM public.classrooms WHERE teacher_id = auth.uid())
    );

-- Questions:
DROP POLICY IF EXISTS "Teachers manage questions" ON public.questions;
CREATE POLICY "Teachers manage questions"
    ON public.questions FOR ALL
    TO authenticated
    USING (
        school_id IN (
            SELECT school_id FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'TEACHER'
        )
    );

-- Learning Materials:
DROP POLICY IF EXISTS "Teachers manage learning materials" ON public.learning_materials;
CREATE POLICY "Teachers manage learning materials"
    ON public.learning_materials FOR ALL
    TO authenticated
    USING (
        school_id IN (
            SELECT school_id FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'TEACHER'
        )
    );

DROP POLICY IF EXISTS "Students view published learning materials" ON public.learning_materials;
CREATE POLICY "Students view published learning materials"
    ON public.learning_materials FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.class_memberships m
            WHERE m.student_id = auth.uid()
            AND m.class_id = ANY(public.learning_materials.published_to_classes)
        )
    );

-- Exams:
DROP POLICY IF EXISTS "Teachers manage exams" ON public.exams;
CREATE POLICY "Teachers manage exams"
    ON public.exams FOR ALL
    TO authenticated
    USING (
        teacher_id = auth.uid() OR
        school_id IN (
            SELECT school_id FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'TEACHER'
        )
    );

DROP POLICY IF EXISTS "Students view published exams for their class" ON public.exams;
CREATE POLICY "Students view published exams for their class"
    ON public.exams FOR SELECT
    TO authenticated
    USING (
        status = 'published' AND
        class_id IN (
            SELECT class_id FROM public.class_memberships 
            WHERE student_id = auth.uid()
        )
    );

-- Exam Attempts:
DROP POLICY IF EXISTS "Students manage their own exam attempts" ON public.exam_attempts;
CREATE POLICY "Students manage their own exam attempts"
    ON public.exam_attempts FOR ALL
    TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Teachers view and grade attempts of their exams" ON public.exam_attempts;
CREATE POLICY "Teachers view and grade attempts of their exams"
    ON public.exam_attempts FOR ALL
    TO authenticated
    USING (
        exam_id IN (
            SELECT id FROM public.exams WHERE teacher_id = auth.uid()
        )
    );

-- Notifications:
DROP POLICY IF EXISTS "Users manage their own notifications" ON public.notifications;
CREATE POLICY "Users manage their own notifications"
    ON public.notifications FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ==============================================================================
-- INITIAL SEED DATA FOR SCHOOLS
-- ==============================================================================
INSERT INTO public.schools (id, name, slug, region_id, region_name, address)
VALUES 
    ('sch-ponorogo-01', 'SD Negeri 1 Ponorogo', 'sdn-1-ponorogo', '35.02', 'Kabupaten Ponorogo', 'Jl. Diponegoro No. 12, Mangkujayan, Ponorogo'),
    ('sch-madiun-01', 'SD Negeri 001 Madiun', 'sdn-001-madiun', '35.77', 'Kota Madiun', 'Jl. Pahlawan No. 45, Kartoharjo, Madiun')
ON CONFLICT (id) DO NOTHING;
