-- DEPASKAN E2E Schema Enhancements
-- 1. Storage bucket 'avatars' for profile pictures
-- 2. Table 'public.room_submissions' for online students & print+scan tracking
-- 3. Table 'public.document_issuances' for verifiable PDF print & QR authenticity

-- 1. Create avatars bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS policies for avatars
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read avatars'
  ) THEN
    CREATE POLICY "Public read avatars" ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated insert avatars'
  ) THEN
    CREATE POLICY "Authenticated insert avatars" ON storage.objects
      FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated update avatars'
  ) THEN
    CREATE POLICY "Authenticated update avatars" ON storage.objects
      FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
  END IF;
END $$;

-- 2. Room Submissions Table (Online and Print + Scan)
CREATE TABLE IF NOT EXISTS public.room_submissions (
    id TEXT PRIMARY KEY DEFAULT ('SUB-' || upper(substr(md5(random()::text), 1, 8))),
    room_id TEXT NOT NULL,
    room_code TEXT NOT NULL,
    student_name TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'Online', -- 'Online' | 'Print + Scan'
    status TEXT NOT NULL DEFAULT 'Selesai', -- 'Belum mulai' | 'Sedang mengerjakan' | 'Selesai' | 'Dinilai' | 'Belum dinilai' | 'Sudah dinilai'
    score NUMERIC DEFAULT 0,
    mc_score NUMERIC DEFAULT 0,
    essay_score NUMERIC,
    answers JSONB DEFAULT '{}'::jsonb, -- e.g. { "mc": "B", "essay": "...", "mc_details": [...] }
    teacher_feedback TEXT,
    document_id TEXT, -- Verifiable document ID if source is Print + Scan
    device_info TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_room_submissions_room_code ON public.room_submissions(room_code);
CREATE INDEX IF NOT EXISTS idx_room_submissions_student_name ON public.room_submissions(student_name);
CREATE INDEX IF NOT EXISTS idx_room_submissions_source ON public.room_submissions(source);

ALTER TABLE public.room_submissions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'room_submissions' AND policyname = 'Allow anon student insert submission'
  ) THEN
    CREATE POLICY "Allow anon student insert submission" ON public.room_submissions
      FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'room_submissions' AND policyname = 'Allow authenticated read all submissions'
  ) THEN
    CREATE POLICY "Allow authenticated read all submissions" ON public.room_submissions
      FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'room_submissions' AND policyname = 'Allow authenticated update submissions'
  ) THEN
    CREATE POLICY "Allow authenticated update submissions" ON public.room_submissions
      FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

-- 3. Document Issuances Table (for Print PDF & Verifiable QR)
CREATE TABLE IF NOT EXISTS public.document_issuances (
    id TEXT PRIMARY KEY, -- e.g. 'DOC-2026-XXXX'
    document_token TEXT NOT NULL UNIQUE, -- Embedded in QR code
    doc_type TEXT NOT NULL, -- 'material' | 'question' | 'room' | 'exam'
    content_id TEXT NOT NULL,
    content_title TEXT NOT NULL,
    content_version_id TEXT DEFAULT 'v1',
    room_id TEXT,
    room_code TEXT,
    teacher_id TEXT,
    school_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- question count, answer key hash, subject, grade, etc.
    issued_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_document_issuances_token ON public.document_issuances(document_token);
CREATE INDEX IF NOT EXISTS idx_document_issuances_content_id ON public.document_issuances(content_id);
CREATE INDEX IF NOT EXISTS idx_document_issuances_room_code ON public.document_issuances(room_code);

ALTER TABLE public.document_issuances ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'document_issuances' AND policyname = 'Allow authenticated read document issuances'
  ) THEN
    CREATE POLICY "Allow authenticated read document issuances" ON public.document_issuances
      FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'document_issuances' AND policyname = 'Allow authenticated insert document issuances'
  ) THEN
    CREATE POLICY "Allow authenticated insert document issuances" ON public.document_issuances
      FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  -- Allow anon to verify valid document issuances by token (for scanning)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'document_issuances' AND policyname = 'Allow anon read document issuances'
  ) THEN
    CREATE POLICY "Allow anon read document issuances" ON public.document_issuances
      FOR SELECT TO anon USING (true);
  END IF;
END $$;
