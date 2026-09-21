-- ContextLearning Database Schema Migration
-- Designed for PostgreSQL / Supabase
-- Target: IT Competition POLNES Hackathon Prototype

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone_number TEXT,
  school_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. REGIONS TABLE (Hierarchical regional characteristics)
CREATE TABLE IF NOT EXISTS public.regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  province TEXT NOT NULL,
  regency TEXT NOT NULL,
  district TEXT NOT NULL,
  village TEXT,
  geographical_summary TEXT,
  economic_summary TEXT,
  cultural_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  province TEXT NOT NULL,
  regency TEXT NOT NULL,
  district TEXT NOT NULL,
  village TEXT,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  description TEXT,
  local_characteristics TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key back to profiles
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_school
  FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;

-- 4. LOCAL KNOWLEDGE BASE
CREATE TABLE IF NOT EXISTS public.local_knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  entity_category TEXT NOT NULL CHECK (entity_category IN ('geography', 'infrastructure', 'economy', 'transportation', 'social', 'culture')),
  entity_name TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT DEFAULT 'Dinas Pendidikan & Observasi Kurikulum Lokal',
  suitability_notes TEXT,
  verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'teacher_provided', 'illustrative_demo')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CLASSES TABLE
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  grade INT NOT NULL CHECK (grade BETWEEN 1 AND 6),
  subjects TEXT[] NOT NULL DEFAULT ARRAY['Matematika', 'Bahasa Indonesia', 'IPS'],
  join_code TEXT NOT NULL UNIQUE,
  academic_year TEXT DEFAULT '2026/2027',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CLASS MEMBERSHIPS
CREATE TABLE IF NOT EXISTS public.class_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  UNIQUE (class_id, student_id)
);

-- 7. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject IN ('Matematika', 'Bahasa Indonesia', 'IPS')),
  grade INT NOT NULL CHECK (grade BETWEEN 1 AND 6),
  topic TEXT NOT NULL,
  learning_objective TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'essay')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  original_text TEXT NOT NULL,
  question_template TEXT,
  context_variables JSONB DEFAULT '[]'::jsonb,
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  rubric TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai_generated', 'scanned_image')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. QUESTION CONTEXTUALIZATIONS (Regional adaptations)
CREATE TABLE IF NOT EXISTS public.question_contextualizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  contextualized_text TEXT NOT NULL,
  contextualized_options JSONB DEFAULT '[]'::jsonb,
  variable_replacements JSONB DEFAULT '{}'::jsonb,
  validation_status TEXT NOT NULL DEFAULT 'needs_review' CHECK (validation_status IN ('verified', 'needs_review', 'unvalidated')),
  validation_notes TEXT,
  teacher_edited BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. LEARNING MATERIALS
CREATE TABLE IF NOT EXISTS public.learning_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  subject TEXT NOT NULL CHECK (subject IN ('Matematika', 'Bahasa Indonesia', 'IPS')),
  grade INT NOT NULL CHECK (grade BETWEEN 1 AND 6),
  topic TEXT NOT NULL,
  learning_objectives TEXT NOT NULL,
  original_content TEXT NOT NULL,
  contextualized_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. EXAMINATIONS
CREATE TABLE IF NOT EXISTS public.examinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade INT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'ongoing', 'completed', 'results_published')),
  show_results_immediately BOOLEAN NOT NULL DEFAULT FALSE,
  allow_review BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. EXAMINATION QUESTIONS (Junction)
CREATE TABLE IF NOT EXISTS public.examination_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  examination_id UUID NOT NULL REFERENCES public.examinations(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  order_index INT NOT NULL DEFAULT 1,
  UNIQUE (examination_id, question_id)
);

-- 12. EXAMINATION ATTEMPTS
CREATE TABLE IF NOT EXISTS public.examination_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  examination_id UUID NOT NULL REFERENCES public.examinations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submit_time TIMESTAMPTZ,
  score NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded')),
  UNIQUE (examination_id, student_id)
);

-- 13. STUDENT ANSWERS
CREATE TABLE IF NOT EXISTS public.student_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES public.examination_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option TEXT,
  essay_answer TEXT,
  is_correct BOOLEAN,
  score NUMERIC(5,2),
  feedback TEXT,
  evaluated_by_ai BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed_by_teacher BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (attempt_id, question_id)
);

-- 14. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('class', 'exam', 'material', 'grade', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. AI GENERATION AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_join_code ON public.classes(join_code);
CREATE INDEX IF NOT EXISTS idx_class_memberships_student ON public.class_memberships(student_id);
CREATE INDEX IF NOT EXISTS idx_questions_teacher ON public.questions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_grade ON public.questions(subject, grade);
CREATE INDEX IF NOT EXISTS idx_local_kb_region ON public.local_knowledge_base(region_id, entity_category);
CREATE INDEX IF NOT EXISTS idx_examinations_class ON public.examinations(class_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student ON public.examination_attempts(student_id, examination_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_contextualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examination_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examination_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own or teachers of their classes
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Regions & Schools: readable by authenticated users
CREATE POLICY "Regions readable by authenticated users"
  ON public.regions FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Schools readable by authenticated users"
  ON public.schools FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Teachers can insert schools"
  ON public.schools FOR INSERT
  TO authenticated WITH CHECK (true);

-- Local Knowledge Base: readable by authenticated users
CREATE POLICY "Knowledge base readable by authenticated users"
  ON public.local_knowledge_base FOR SELECT
  TO authenticated USING (true);

-- Classes: Teachers manage their own; Students see active classes they belong to
CREATE POLICY "Teachers can manage own classes"
  ON public.classes FOR ALL
  TO authenticated USING (teacher_id = auth.uid());

CREATE POLICY "Students can view classes they joined"
  ON public.classes FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.class_memberships
      WHERE class_memberships.class_id = classes.id
      AND class_memberships.student_id = auth.uid()
    )
  );

-- Class Memberships: Teachers manage; Students can view own memberships
CREATE POLICY "Class memberships student view"
  ON public.class_memberships FOR SELECT
  TO authenticated USING (student_id = auth.uid());

CREATE POLICY "Teachers manage class memberships"
  ON public.class_memberships FOR ALL
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = class_memberships.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Questions: Teachers manage own questions
CREATE POLICY "Teachers manage own questions"
  ON public.questions FOR ALL
  TO authenticated USING (teacher_id = auth.uid());

-- CRITICAL EXAM SECURITY: Students NEVER query questions table directly with correct_answer.
-- Safe question projections are provided via server-side session endpoints.

-- Examinations: Teachers manage own; Students view scheduled/ongoing/results_published in their classes
CREATE POLICY "Teachers manage own examinations"
  ON public.examinations FOR ALL
  TO authenticated USING (teacher_id = auth.uid());

CREATE POLICY "Students view examinations of their classes"
  ON public.examinations FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.class_memberships
      WHERE class_memberships.class_id = examinations.class_id
      AND class_memberships.student_id = auth.uid()
    )
  );

-- Attempts & Answers: Students manage their own attempts; Teachers review for their exams
CREATE POLICY "Students manage own examination attempts"
  ON public.examination_attempts FOR ALL
  TO authenticated USING (student_id = auth.uid());

CREATE POLICY "Teachers view attempts of their examinations"
  ON public.examination_attempts FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.examinations
      WHERE examinations.id = examination_attempts.examination_id
      AND examinations.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students manage own answers"
  ON public.student_answers FOR ALL
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.examination_attempts
      WHERE examination_attempts.id = student_answers.attempt_id
      AND examination_attempts.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers view and grade student answers"
  ON public.student_answers FOR ALL
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.examination_attempts
      JOIN public.examinations ON examinations.id = examination_attempts.examination_id
      WHERE examination_attempts.id = student_answers.attempt_id
      AND examinations.teacher_id = auth.uid()
    )
  );

-- Notifications: users see only their own
CREATE POLICY "Users see own notifications"
  ON public.notifications FOR ALL
  TO authenticated USING (user_id = auth.uid());
