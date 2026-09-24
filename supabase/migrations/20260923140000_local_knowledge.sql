-- ====================================================================
-- MIGRATION: 20260923140000_local_knowledge.sql
-- DESCRIPTION: Local Knowledge Base (LKB) Schema for Pahami V2 (Karesidenan Madiun)
-- AUTHOR: Anggota 1 (Data & RAG Engineer)
-- NON-DESTRUCTIVE: All tables, views, and functions use `lkb_*` prefix
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Regions Table (lkb_regions)
CREATE TABLE IF NOT EXISTS lkb_regions (
    region_id VARCHAR(16) PRIMARY KEY, -- e.g. '35.77', '35.19'
    parent_id VARCHAR(16) REFERENCES lkb_regions(region_id),
    name VARCHAR(255) NOT NULL,
    popular_name VARCHAR(255),
    level VARCHAR(32) NOT NULL CHECK (level IN ('province', 'regency', 'city', 'district', 'village')),
    code_source VARCHAR(64) DEFAULT 'BPS_KEMENDAGRI_2024',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Source Registry Table (lkb_sources)
CREATE TABLE IF NOT EXISTS lkb_sources (
    source_id VARCHAR(64) PRIMARY KEY,
    publisher VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    published_at DATE,
    retrieved_at DATE NOT NULL,
    license VARCHAR(128) NOT NULL,
    attribution_note TEXT,
    import_mode VARCHAR(32) DEFAULT 'manual_curated',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Context Entities Table (lkb_entities)
CREATE TABLE IF NOT EXISTS lkb_entities (
    entity_id VARCHAR(64) PRIMARY KEY,
    region_id VARCHAR(16) NOT NULL REFERENCES lkb_regions(region_id),
    category VARCHAR(64) NOT NULL CHECK (category IN (
        'geography',
        'built_environment',
        'livelihood',
        'mobility',
        'community',
        'culture',
        'nature_environment',
        'administratif'
    )),
    subcategory VARCHAR(64) NOT NULL,
    canonical_name VARCHAR(255) NOT NULL,
    aliases TEXT[] DEFAULT '{}',
    short_description TEXT NOT NULL,
    educational_usage TEXT NOT NULL,
    grade_suitability INT[] DEFAULT '{1,2,3,4,5,6}',
    subject_tags TEXT[] DEFAULT '{matematika,bahasa_indonesia,ips}',
    safe_for_word_problem BOOLEAN DEFAULT TRUE,
    quantitative_constraints JSONB DEFAULT '{}'::jsonb,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'in_review', 'draft')),
    dedup_fingerprint VARCHAR(64) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Evidence Table (lkb_entity_evidence)
CREATE TABLE IF NOT EXISTS lkb_entity_evidence (
    evidence_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id VARCHAR(64) NOT NULL REFERENCES lkb_entities(entity_id) ON DELETE CASCADE,
    source_id VARCHAR(64) NOT NULL REFERENCES lkb_sources(source_id),
    claim TEXT NOT NULL,
    section_reference TEXT,
    reviewer VARCHAR(64) NOT NULL,
    verified_at DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Relations Table (lkb_entity_relations)
CREATE TABLE IF NOT EXISTS lkb_entity_relations (
    relation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_entity_id VARCHAR(64) NOT NULL REFERENCES lkb_entities(entity_id) ON DELETE CASCADE,
    target_entity_id VARCHAR(64) NOT NULL REFERENCES lkb_entities(entity_id) ON DELETE CASCADE,
    relation_type VARCHAR(64) NOT NULL, -- e.g. 'produces', 'transports_to', 'located_in'
    provenance TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Knowledge Passages Table with pgvector (lkb_passages)
CREATE TABLE IF NOT EXISTS lkb_passages (
    passage_id VARCHAR(64) PRIMARY KEY,
    entity_id VARCHAR(64) NOT NULL REFERENCES lkb_entities(entity_id) ON DELETE CASCADE,
    region_id VARCHAR(16) NOT NULL REFERENCES lkb_regions(region_id),
    source_id VARCHAR(64) NOT NULL REFERENCES lkb_sources(source_id),
    content TEXT NOT NULL,
    chunk_sequence INT NOT NULL DEFAULT 0,
    embedding vector(384), -- intfloat/multilingual-e5-small dimensions
    model_id VARCHAR(64) DEFAULT 'intfloat/multilingual-e5-small',
    revision_hash VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'verified' CHECK (status IN ('verified', 'in_review', 'draft')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Ingestion Runs Log Table (lkb_ingestion_runs)
CREATE TABLE IF NOT EXISTS lkb_ingestion_runs (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id VARCHAR(16),
    total_entities_processed INT DEFAULT 0,
    total_entities_inserted INT DEFAULT 0,
    total_passages_indexed INT DEFAULT 0,
    warnings JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(32) NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_lkb_entities_region ON lkb_entities(region_id);
CREATE INDEX IF NOT EXISTS idx_lkb_entities_category ON lkb_entities(category);
CREATE INDEX IF NOT EXISTS idx_lkb_entities_status ON lkb_entities(verification_status);
CREATE INDEX IF NOT EXISTS idx_lkb_evidence_entity ON lkb_entity_evidence(entity_id);
CREATE INDEX IF NOT EXISTS idx_lkb_passages_entity ON lkb_passages(entity_id);
CREATE INDEX IF NOT EXISTS idx_lkb_passages_region ON lkb_passages(region_id);

-- Full Text Search Index on Entities (Canonical Name, Description, Educational Usage)
CREATE INDEX IF NOT EXISTS idx_lkb_entities_fts ON lkb_entities 
USING gin(to_tsvector('simple', canonical_name || ' ' || short_description || ' ' || educational_usage));

-- Vector Index (Cosine Distance)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lkb_passages_embedding_cosine'
    ) THEN
        CREATE INDEX idx_lkb_passages_embedding_cosine ON lkb_passages 
        USING hnsw (embedding vector_cosine_ops);
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        -- Fallback if HNSW is not available on older pgvector versions
        NULL;
END $$;

-- 10. Security: Row Level Security (RLS)
ALTER TABLE lkb_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lkb_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE lkb_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lkb_entity_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE lkb_entity_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lkb_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lkb_ingestion_runs ENABLE ROW LEVEL SECURITY;

-- Read policies: public/anon can ONLY select verified data
DROP POLICY IF EXISTS lkb_regions_read_policy ON lkb_regions;
CREATE POLICY lkb_regions_read_policy ON lkb_regions FOR SELECT USING (true);

DROP POLICY IF EXISTS lkb_sources_read_policy ON lkb_sources;
CREATE POLICY lkb_sources_read_policy ON lkb_sources FOR SELECT USING (true);

DROP POLICY IF EXISTS lkb_entities_read_verified ON lkb_entities;
CREATE POLICY lkb_entities_read_verified ON lkb_entities FOR SELECT USING (verification_status = 'verified');

DROP POLICY IF EXISTS lkb_evidence_read_policy ON lkb_entity_evidence;
CREATE POLICY lkb_evidence_read_policy ON lkb_entity_evidence FOR SELECT USING (true);

DROP POLICY IF EXISTS lkb_passages_read_verified ON lkb_passages;
CREATE POLICY lkb_passages_read_verified ON lkb_passages FOR SELECT USING (status = 'verified');

DROP POLICY IF EXISTS lkb_relations_read_policy ON lkb_entity_relations;
CREATE POLICY lkb_relations_read_policy ON lkb_entity_relations FOR SELECT USING (true);

-- 11. Stored Procedure for Zero-Python-Server Retrieval
-- Can be called via `supabase.rpc('lkb_retrieve_context', { ... })`
CREATE OR REPLACE FUNCTION lkb_retrieve_context(
    p_region_id TEXT,
    p_category TEXT DEFAULT NULL,
    p_subcategory TEXT DEFAULT NULL,
    p_query TEXT DEFAULT '',
    p_grade INT DEFAULT NULL,
    p_subject TEXT DEFAULT NULL,
    p_limit INT DEFAULT 5,
    p_mode TEXT DEFAULT 'structured_lexical',
    p_query_embedding vector(384) DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_target_region_id TEXT := TRIM(p_region_id);
    v_fallback_level TEXT := 'exact';
    v_mode_used TEXT := COALESCE(p_mode, 'structured_lexical');
    v_warnings JSONB := '[]'::jsonb;
    v_results JSONB := '[]'::jsonb;
    v_limit INT := LEAST(GREATEST(COALESCE(p_limit, 5), 1), 20);
    v_clean_query TEXT := TRIM(COALESCE(p_query, ''));
    v_region_rec RECORD;
    v_parent_rec RECORD;
    v_clean_subject TEXT := NULL;
    v_clean_cat TEXT := NULL;
BEGIN
    -- Normalize subject parameter if passed (e.g. "Matematika" -> "matematika", "Bahasa Indonesia" -> "bahasa_indonesia")
    IF p_subject IS NOT NULL AND TRIM(p_subject) <> '' THEN
        v_clean_subject := LOWER(REPLACE(TRIM(p_subject), ' ', '_'));
    END IF;

    -- Normalize category parameter if passed
    IF p_category IS NOT NULL AND TRIM(p_category) <> '' THEN
        v_clean_cat := LOWER(TRIM(p_category));
    END IF;

    -- 1. Validate Region and Hierarchy Fallback
    SELECT * INTO v_region_rec FROM lkb_regions WHERE region_id = v_target_region_id;

    IF NOT FOUND THEN
        -- Region ID not in database at all (e.g. 33.74 Semarang or 35.77.99 fake district)
        RETURN jsonb_build_object(
            'requested_region_id', p_region_id,
            'matched_region_id', p_region_id,
            'region_fallback_level', 'none',
            'retrieval_mode_used', v_mode_used,
            'results', '[]'::jsonb,
            'warnings', jsonb_build_array('Wilayah tidak terdaftar dalam cakupan Karesidenan Madiun')
        );
    END IF;

    -- If target region is an official district, check if there are direct entities; if not, fallback to parent regency
    IF v_region_rec.level = 'district' THEN
        IF NOT EXISTS (SELECT 1 FROM lkb_entities WHERE region_id = v_target_region_id AND verification_status = 'verified') THEN
            v_target_region_id := v_region_rec.parent_id;
            v_fallback_level := 'district_to_regency';
            SELECT * INTO v_parent_rec FROM lkb_regions WHERE region_id = v_target_region_id;
            IF NOT FOUND THEN
                RETURN jsonb_build_object(
                    'requested_region_id', p_region_id,
                    'matched_region_id', p_region_id,
                    'region_fallback_level', 'none',
                    'retrieval_mode_used', v_mode_used,
                    'results', '[]'::jsonb,
                    'warnings', jsonb_build_array('Parent wilayah untuk kecamatan tidak ditemukan')
                );
            END IF;
        END IF;
    END IF;

    -- 2. Validate Semantic Mode & Vector Availability
    IF v_mode_used = 'semantic' THEN
        IF p_query_embedding IS NULL THEN
            v_mode_used := 'structured_lexical';
            v_warnings := v_warnings || jsonb_build_array('Semantic mode requested without query embedding vector; defaulted to structured_lexical');
        END IF;
    END IF;

    -- 3. Execute Retrieval
    IF v_mode_used = 'semantic' AND p_query_embedding IS NOT NULL THEN
        -- Actual Vector Semantic Search using Cosine Distance (<=>)
        WITH scored_passages AS (
            SELECT 
                p.entity_id,
                p.passage_id,
                p.content,
                1 - (p.embedding <=> p_query_embedding) AS similarity
            FROM lkb_passages p
            WHERE p.status = 'verified'
              AND (p.region_id = v_target_region_id)
            ORDER BY p.embedding <=> p_query_embedding ASC
            LIMIT 50
        ),
        best_entity_matches AS (
            SELECT 
                e.entity_id,
                e.canonical_name,
                e.short_description,
                e.category,
                e.subcategory,
                e.region_id,
                r.name AS region_name,
                e.educational_usage,
                e.quantitative_constraints,
                e.verification_status,
                MAX(sp.similarity) AS match_score
            FROM scored_passages sp
            JOIN lkb_entities e ON e.entity_id = sp.entity_id
            JOIN lkb_regions r ON r.region_id = e.region_id
            WHERE e.verification_status = 'verified'
              AND (
                  v_clean_cat IS NULL 
                  OR LOWER(e.category) = v_clean_cat
                  OR (v_clean_cat = 'commodity' AND e.category IN ('livelihood', 'culture'))
                  OR (v_clean_cat = 'tradition' AND e.category = 'culture')
                  OR (v_clean_cat = 'location' AND e.category IN ('built_environment', 'geography'))
                  OR (v_clean_cat = 'occupation' AND e.category = 'livelihood')
              )
              AND (p_subcategory IS NULL OR e.subcategory ILIKE p_subcategory)
              AND (p_grade IS NULL OR p_grade = ANY(e.grade_suitability))
              AND (v_clean_subject IS NULL OR v_clean_subject = ANY(e.subject_tags))
            GROUP BY e.entity_id, e.canonical_name, e.short_description, e.category, e.subcategory, e.region_id, r.name, e.educational_usage, e.quantitative_constraints, e.verification_status
            ORDER BY match_score DESC, e.canonical_name ASC
            LIMIT v_limit
        ),
        entities_with_evidence AS (
            SELECT 
                b.entity_id,
                b.canonical_name AS name,
                b.canonical_name,
                b.category,
                b.subcategory,
                b.region_id,
                b.region_name,
                b.short_description,
                b.short_description AS description,
                b.educational_usage,
                b.quantitative_constraints,
                b.verification_status,
                COALESCE(
                    (
                        SELECT s.url
                        FROM lkb_entity_evidence ev
                        JOIN lkb_sources s ON s.source_id = ev.source_id
                        WHERE ev.entity_id = b.entity_id
                        LIMIT 1
                    ),
                    ''
                ) AS source_url,
                COALESCE(
                    (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'source_id', ev.source_id,
                                'url', s.url,
                                'claim', ev.claim,
                                'license_note', s.license
                            )
                        )
                        FROM lkb_entity_evidence ev
                        JOIN lkb_sources s ON s.source_id = ev.source_id
                        WHERE ev.entity_id = b.entity_id
                    ),
                    '[]'::jsonb
                ) AS evidence
            FROM best_entity_matches b
        )
        SELECT COALESCE(jsonb_agg(to_jsonb(ewe)), '[]'::jsonb)
        INTO v_results
        FROM entities_with_evidence ewe;

    ELSE
        -- Structured + Lexical Search (Default Online Mode)
        WITH matched_entities AS (
            SELECT 
                e.entity_id,
                e.canonical_name,
                e.short_description,
                e.category,
                e.subcategory,
                e.region_id,
                r.name AS region_name,
                e.educational_usage,
                e.quantitative_constraints,
                e.verification_status,
                (
                    CASE 
                        WHEN v_clean_query = '' THEN 1.0
                        WHEN e.canonical_name ILIKE '%' || v_clean_query || '%' THEN 5.0
                        WHEN e.short_description ILIKE '%' || v_clean_query || '%' THEN 3.0
                        WHEN e.educational_usage ILIKE '%' || v_clean_query || '%' THEN 2.0
                        WHEN to_tsvector('simple', e.canonical_name || ' ' || e.short_description) @@ plainto_tsquery('simple', v_clean_query) THEN 2.5
                        ELSE 0.5
                    END
                ) AS match_score
            FROM lkb_entities e
            JOIN lkb_regions r ON r.region_id = e.region_id
            WHERE e.verification_status = 'verified'
              AND (e.region_id = v_target_region_id)
              AND (
                  v_clean_cat IS NULL 
                  OR LOWER(e.category) = v_clean_cat
                  OR (v_clean_cat = 'commodity' AND e.category IN ('livelihood', 'culture'))
                  OR (v_clean_cat = 'tradition' AND e.category = 'culture')
                  OR (v_clean_cat = 'location' AND e.category IN ('built_environment', 'geography'))
                  OR (v_clean_cat = 'occupation' AND e.category = 'livelihood')
              )
              AND (p_subcategory IS NULL OR e.subcategory ILIKE p_subcategory)
              AND (p_grade IS NULL OR p_grade = ANY(e.grade_suitability))
              AND (v_clean_subject IS NULL OR v_clean_subject = ANY(e.subject_tags))
              AND (
                  v_clean_query = '' 
                  OR e.canonical_name ILIKE '%' || v_clean_query || '%'
                  OR e.short_description ILIKE '%' || v_clean_query || '%'
                  OR e.educational_usage ILIKE '%' || v_clean_query || '%'
                  OR to_tsvector('simple', e.canonical_name || ' ' || e.short_description) @@ plainto_tsquery('simple', v_clean_query)
              )
            ORDER BY match_score DESC, e.canonical_name ASC
            LIMIT v_limit
        ),
        entities_with_evidence AS (
            SELECT 
                m.entity_id,
                m.canonical_name AS name,
                m.canonical_name,
                m.category,
                m.subcategory,
                m.region_id,
                m.region_name,
                m.short_description,
                m.short_description AS description,
                m.educational_usage,
                m.quantitative_constraints,
                m.verification_status,
                COALESCE(
                    (
                        SELECT s.url
                        FROM lkb_entity_evidence ev
                        JOIN lkb_sources s ON s.source_id = ev.source_id
                        WHERE ev.entity_id = m.entity_id
                        LIMIT 1
                    ),
                    ''
                ) AS source_url,
                COALESCE(
                    (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'source_id', ev.source_id,
                                'url', s.url,
                                'claim', ev.claim,
                                'license_note', s.license
                            )
                        )
                        FROM lkb_entity_evidence ev
                        JOIN lkb_sources s ON s.source_id = ev.source_id
                        WHERE ev.entity_id = m.entity_id
                    ),
                    '[]'::jsonb
                ) AS evidence
            FROM matched_entities m
        )
        SELECT COALESCE(jsonb_agg(to_jsonb(ewe)), '[]'::jsonb)
        INTO v_results
        FROM entities_with_evidence ewe;
    END IF;

    -- Return JSON payload matching RetrievalResponse contract
    RETURN jsonb_build_object(
        'requested_region_id', p_region_id,
        'matched_region_id', v_target_region_id,
        'region_fallback_level', v_fallback_level,
        'retrieval_mode_used', v_mode_used,
        'results', v_results,
        'warnings', v_warnings
    );
END;
$$;
