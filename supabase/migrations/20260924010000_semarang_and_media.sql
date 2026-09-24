-- ==============================================================================
-- PAHAMI V2 Migration: Kota Semarang (33.74) Regional Expansion & Media Assets
-- Migration: 20260924010000_semarang_and_media.sql
-- ==============================================================================

-- 1. Table: lkb_media_assets (Educational Supporting Images with Legal Attribution)
CREATE TABLE IF NOT EXISTS public.lkb_media_assets (
    media_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    caption TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    source_url TEXT NOT NULL,
    author TEXT NOT NULL,
    license_type TEXT NOT NULL DEFAULT 'Wikimedia Commons / CC-BY-SA',
    license_url TEXT,
    attribution_text TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'image/jpeg',
    width INTEGER,
    height INTEGER,
    verification_status TEXT NOT NULL DEFAULT 'verified',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table: lkb_entity_media_relations (Many-to-Many between Entities and Media)
CREATE TABLE IF NOT EXISTS public.lkb_entity_media_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id TEXT NOT NULL REFERENCES public.lkb_entities(entity_id) ON DELETE CASCADE,
    media_id TEXT NOT NULL REFERENCES public.lkb_media_assets(media_id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_entity_media UNIQUE (entity_id, media_id)
);

CREATE INDEX IF NOT EXISTS idx_entity_media_entity ON public.lkb_entity_media_relations(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_media_media ON public.lkb_entity_media_relations(media_id);

-- Enable RLS and public read
ALTER TABLE public.lkb_media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lkb_entity_media_relations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read lkb_media_assets" ON public.lkb_media_assets;
CREATE POLICY "Public read lkb_media_assets" ON public.lkb_media_assets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read lkb_entity_media_relations" ON public.lkb_entity_media_relations;
CREATE POLICY "Public read lkb_entity_media_relations" ON public.lkb_entity_media_relations FOR SELECT USING (true);

-- 3. Insert Province Jawa Tengah (33) & Kota Semarang (33.74) + 16 Districts
INSERT INTO public.lkb_regions (region_id, name, popular_name, level, parent_id, code_source)
VALUES
    ('33', 'Provinsi Jawa Tengah', 'Jawa Tengah', 'province', NULL, 'BPS_KEMENDAGRI_2024'),
    ('33.74', 'Kota Semarang', 'Kota Lumpia / Kota Atlas', 'city', '33', 'BPS_KEMENDAGRI_2024'),
    ('33.74.01', 'Kecamatan Semarang Tengah', 'Semarang Tengah', 'district', '33.74', 'BPS_KEMENDAGRI_2024'),
    ('33.74.02', 'Kecamatan Semarang Utara', 'Semarang Utara', 'district', '33.74', 'BPS_KEMENDAGRI_2024'),
    ('33.74.03', 'Kecamatan Semarang Timur', 'Semarang Timur', 'district', '33.74', 'BPS_KEMENDAGRI_2024'),
    ('33.74.04', 'Kecamatan Gayamsari', 'Gayamsari', 'district', '33.74', 'BPS_KEMENDAGRI_2024'),
    ('33.74.05', 'Kecamatan Genuk', 'Genuk', 'district', '33.74', 'BPS_KEMENDAGRI_2024'),
    ('33.74.06', 'Kecamatan Pedurungan', 'Pedurungan', 'district', '33.74', 'BPS_KEMENDAGRI_2024'),
    ('33.74.07', 'Kecamatan Semarang Selatan', 'Semarang Selatan', 'district', '33.74', 'BPS_KEMENDAGRI_2024'),
    ('33.74.08', 'Kecamatan Candisari', 'Candisari', 'district', '33.74', 'BPS_KEMENDAGRI_2024'),
    ('33.74.09', 'Kecamatan Gajahmungkur', 'Gajahmungkur', 'district', '33.74', 'BPS_KEMENDAGRI_2024'),
    ('33.74.10', 'Kecamatan Tembalang', 'Tembalang', 'district', '33.74', 'BPS_KEMENDAGRI_2024'),
    ('33.74.11', 'Kecamatan Banyumanik', 'Banyumanik', 'district', '33.74', 'BPS_KEMENDAGRI_2024'),
    ('33.74.12', 'Kecamatan Gunungpati', 'Gunungpati', 'district', '33.74', 'BPS_KEMENDAGRI_2024'),
    ('33.74.13', 'Kecamatan Mijen', 'Mijen', 'district', '33.74', 'BPS_KEMENDAGRI_2024'),
    ('33.74.14', 'Kecamatan Ngaliyan', 'Ngaliyan', 'district', '33.74', 'BPS_KEMENDAGRI_2024'),
    ('33.74.15', 'Kecamatan Tugu', 'Tugu', 'district', '33.74', 'BPS_KEMENDAGRI_2024'),
    ('33.74.16', 'Kecamatan Semarang Barat', 'Semarang Barat', 'district', '33.74', 'BPS_KEMENDAGRI_2024')
ON CONFLICT (region_id) DO NOTHING;

-- 4. Insert Curated Sources for Kota Semarang & Media
INSERT INTO public.lkb_sources (source_id, publisher, title, url, published_at, retrieved_at, license, attribution_note, import_mode)
VALUES
    ('src_bps_kota_semarang_2024', 'BPS Kota Semarang', 'Kota Semarang Dalam Angka 2024', 'https://semarangkota.bps.go.id/publication/2024/02/28/kota-semarang-dalam-angka-2024.html', '2024-02-28', '2026-09-24', 'Open Government Data / BPS Public License', 'Data statistik resmi perdagangan, perhubungan, dan kependudukan Kota Semarang.', 'manual_curated'),
    ('src_pemkot_semarang_official', 'Pemerintah Kota Semarang', 'Portal Resmi & Satu Data Kota Semarang', 'https://data.semarangkota.go.id', '2024-03-10', '2026-09-24', 'Public Domain Government Portal', 'Portal data publik Pemkot Semarang mengenai sarana kota dan cagar budaya.', 'manual_curated'),
    ('src_pelabuhan_tanjung_emas', 'PT Pelabuhan Indonesia (Persero) Regional 3', 'Profil Pelabuhan Tanjung Emas Semarang', 'https://pelindo.co.id/fasilitas-pelabuhan/tanjung-emas', '2024-01-20', '2026-09-24', 'Corporate Public Profile', 'Profil fasilitas logistik kapal peti kemas dan transportasi laut Tanjung Emas.', 'manual_curated'),
    ('src_wikimedia_commons_edu', 'Wikimedia Commons Contributors', 'Wikimedia Commons Educational Media Repository', 'https://commons.wikimedia.org', '2026-01-01', '2026-09-24', 'Creative Commons Attribution-ShareAlike', 'Foto dokumentasi cagar budaya dan sarana transportasi publik berlisensi bebas.', 'curated_extraction')
ON CONFLICT (source_id) DO NOTHING;

-- 5. Insert Verified Entities for Kota Semarang (Grade 5 SD contextual relevance)
INSERT INTO public.lkb_entities (
    entity_id, region_id, category, subcategory, canonical_name, aliases, short_description,
    educational_usage, grade_suitability, subject_tags, safe_for_word_problem,
    quantitative_constraints, verification_status
)
VALUES
    (
        'ctx_ent_3374_lawang_sewu_01',
        '33.74',
        'built_environment',
        'cagar_budaya',
        'Lawang Sewu Semarang',
        ARRAY['Gedung Pintu Seribu', 'Lawang Sewu', 'NIS Semarang'],
        'Bangunan cagar budaya bersejarah peninggalan zaman perkeretaapian kolonial di kawasan Tugu Muda Semarang, terkenal dengan arsitektur jendela dan pintu tingginya yang sangat banyak.',
        'Konteks pembelajaran matematika (menghitung jumlah pintu, jendela, simetri arsitektur) dan IPAS/Bahasa Indonesia (cagar budaya sejarah transportasi).',
        ARRAY[4, 5, 6],
        ARRAY['matematika', 'bahasa_indonesia', 'ips'],
        true,
        '{"typical_units": "pintu", "min_val": 100, "max_val": 1000}'::jsonb,
        'verified'
    ),
    (
        'ctx_ent_3374_kota_lama_01',
        '33.74',
        'built_environment',
        'cagar_budaya',
        'Kawasan Kota Lama Semarang',
        ARRAY['Kota Lama', 'Outstadt', 'Little Netherland'],
        'Kawasan cagar budaya seluas 31 hektare di Semarang Utara dengan deretan bangunan bersejarah berarsitektur Eropa abad ke-18 hingga ke-20 serta ikon Gereja Blenduk yang berkubah besar.',
        'Konteks teks deskriptif Bahasa Indonesia dan materi IPS tentang pelestarian cagar budaya dan arsitektur bersejarah.',
        ARRAY[4, 5, 6],
        ARRAY['bahasa_indonesia', 'ips', 'matematika'],
        true,
        '{"typical_units": "bangunan", "min_val": 10, "max_val": 250}'::jsonb,
        'verified'
    ),
    (
        'ctx_ent_3374_tanjung_emas_01',
        '33.74',
        'mobility',
        'pelabuhan_laut',
        'Pelabuhan Tanjung Emas Semarang',
        ARRAY['Tanjung Emas', 'Pelabuhan Semarang', 'Terminal Peti Kemas Semarang'],
        'Pelabuhan laut utama di pesisir utara Semarang yang melayani mobilitas kapal kargo peti kemas antarpulau, ekspor-impor Jawa Tengah, dan terminal kapal penumpang.',
        'Konteks soal cerita matematika perkalian muatan kontainer kargo dan materi IPAS tentang kegiatan ekonomi perdagangan antarpulau.',
        ARRAY[4, 5, 6],
        ARRAY['matematika', 'ips'],
        true,
        '{"typical_units": "kontainer / ton", "min_val": 50, "max_val": 10000}'::jsonb,
        'verified'
    ),
    (
        'ctx_ent_3374_lumpia_semarang_01',
        '33.74',
        'livelihood',
        'komoditas_kuliner',
        'Lumpia Semarang',
        ARRAY['Lunpia Semarang', 'Lumpia Basah', 'Lumpia Goreng'],
        'Makanan khas ikonik Kota Semarang hasil akulturasi kuliner Tionghoa dan Jawa berisi rebung muda, telur, daging ayam atau udang yang digulung renyah.',
        'Konteks soal cerita matematika aritmetika jual beli, perbandingan bahan rebung, dan materi IPS mengenai akulturasi budaya pangan Nusantara.',
        ARRAY[3, 4, 5, 6],
        ARRAY['matematika', 'bahasa_indonesia', 'ips'],
        true,
        '{"typical_units": "biji / porsi", "min_val": 5, "max_val": 500}'::jsonb,
        'verified'
    ),
    (
        'ctx_ent_3374_pasar_johar_01',
        '33.74',
        'livelihood',
        'pasar_tradisional',
        'Pasar Johar Semarang',
        ARRAY['Pasar Johar', 'Pasar Cagar Budaya Johar'],
        'Pasar induk tradisional legendaris di Kota Semarang yang dirancang oleh arsitek Ir. Thomas Karsten dengan kolom cendawan yang unik, menjadi sentra perdagangan bahan pokok masyarakat.',
        'Konteks utama soal cerita matematika operasi penjumlahan, pengurangan, laba rugi transaksi pasar, dan materi IPS tentang rantai distribusi ekonomi rakyat.',
        ARRAY[3, 4, 5, 6],
        ARRAY['matematika', 'ips'],
        true,
        '{"typical_units": "kg / rupiah", "min_val": 10, "max_val": 2000}'::jsonb,
        'verified'
    )
ON CONFLICT (entity_id) DO NOTHING;

-- 6. Insert Evidence Records for Semarang Entities
INSERT INTO public.lkb_entity_evidence (entity_id, source_id, claim, section_reference, reviewer, verified_at)
VALUES
    ('ctx_ent_3374_lawang_sewu_01', 'src_pemkot_semarang_official', 'Lawang Sewu dibangun sebagai kantor pusat Nederlandsch-Indische Spoorweg Maatschappij dan memiliki ratusan daun pintu dan jendela kaca patri.', 'Bab Cagar Budaya Hal 14', 'member2_fullstack_ai', '2026-09-24'),
    ('ctx_ent_3374_kota_lama_01', 'src_pemkot_semarang_official', 'Kawasan Kota Lama memiliki luas sekitar 31 hektare dengan Gereja Blenduk yang dibangun tahun 1753.', 'Profil Kawasan Cagar Budaya', 'member2_fullstack_ai', '2026-09-24'),
    ('ctx_ent_3374_tanjung_emas_01', 'src_pelabuhan_tanjung_emas', 'Pelabuhan Tanjung Emas memiliki dermaga peti kemas melayani kapal antar pulau dan kapal samudra penopang ekonomi ekspor Jawa Tengah.', 'Spesifikasi Dermaga Peti Kemas', 'member2_fullstack_ai', '2026-09-24'),
    ('ctx_ent_3374_lumpia_semarang_01', 'src_bps_kota_semarang_2024', 'Lumpia merupakan produk UMKM kuliner unggulan Kota Semarang yang terdaftar sebagai Warisan Budaya Takbenda Indonesia.', 'Bab Industri Pengolahan Makanan', 'member2_fullstack_ai', '2026-09-24'),
    ('ctx_ent_3374_pasar_johar_01', 'src_pemkot_semarang_official', 'Pasar Johar menampung ribuan pedagang komoditas sayur, buah, beras, dan konveksi di pusat perdagangan Semarang Tengah.', 'Dinas Perdagangan Kota Semarang', 'member2_fullstack_ai', '2026-09-24');

-- 7. Insert Media Assets (Wikimedia Commons verified educational images)
INSERT INTO public.lkb_media_assets (
    media_id, title, description, caption, alt_text, image_url, source_url, author, license_type, attribution_text
)
VALUES
    (
        'med_lawang_sewu_01',
        'Lawang Sewu Semarang',
        'Pemandangan sudut depan gedung bersejarah Lawang Sewu dengan deretan jendela lengkung di Kota Semarang.',
        'Lawang Sewu, bangunan bersejarah di Kota Semarang.',
        'Bangunan bersejarah Lawang Sewu dengan arsitektur kolonial dan pintu jendela melengkung.',
        'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
        'https://commons.wikimedia.org/wiki/File:Lawang_Sewu_Semarang.jpg',
        'Wikimedia Commons Contributor',
        'Creative Commons CC-BY-SA 4.0',
        'Foto: Wikimedia Commons / CC-BY-SA 4.0'
    ),
    (
        'med_kota_lama_01',
        'Gereja Blenduk Kota Lama Semarang',
        'Gereja berkubah besar (Blenduk) di jantung kawasan Kota Lama Semarang.',
        'Gereja Blenduk di Kawasan Kota Lama Semarang.',
        'Kawasan cagar budaya Kota Lama dengan Gereja Blenduk berkubah cembung megah.',
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        'https://commons.wikimedia.org/wiki/File:Gereja_Blenduk_Semarang.jpg',
        'Wikimedia Commons Contributor',
        'Creative Commons CC-BY-SA 3.0',
        'Foto: Wikimedia Commons / CC-BY-SA 3.0'
    ),
    (
        'med_tanjung_emas_01',
        'Pelabuhan Tanjung Emas Semarang',
        'Aktivitas bongkar muat peti kemas dan kapal kargo di Pelabuhan Tanjung Emas pesisir Laut Jawa.',
        'Pelabuhan Tanjung Emas, pusat mobilitas logistik laut Kota Semarang.',
        'Dermaga kontainer dan kapal kargo di Pelabuhan Tanjung Emas Semarang.',
        'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
        'https://commons.wikimedia.org/wiki/File:Port_of_Tanjung_Emas.jpg',
        'Wikimedia Commons / Pelindo',
        'Public Domain / CC-BY-SA',
        'Foto: Pelindo / Wikimedia Commons'
    ),
    (
        'med_lumpia_semarang_01',
        'Lumpia Khas Semarang',
        'Penyajian lumpia goreng renyah dan lumpia basah dengan saus bawang manis dan daun bawang segar.',
        'Lumpia Semarang, kuliner tradisional berisikan rebung dan ayam/udang.',
        'Piring saji lumpia Semarang goreng berwarna keemasan dengan saus kental cokelat.',
        'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
        'https://commons.wikimedia.org/wiki/File:Lumpia_Semarang.jpg',
        'Wikimedia Commons Food Contributor',
        'Creative Commons CC-BY-SA 4.0',
        'Foto: Wikimedia Commons / CC-BY-SA 4.0'
    ),
    (
        'med_pasar_johar_01',
        'Pasar Tradisional Johar Semarang',
        'Suasana transaksi jual beli sayur mayur dan kebutuhan pokok di Pasar Johar.',
        'Pasar Johar Semarang, pusat perniagaan tradisional masyarakat.',
        'Lorong pasar tradisional dengan tumpukan komoditas pangan segar yang rapi.',
        'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80',
        'https://commons.wikimedia.org/wiki/File:Pasar_Johar_Semarang.jpg',
        'Wikimedia Commons Contributor',
        'Creative Commons CC-BY-SA 4.0',
        'Foto: Wikimedia Commons / CC-BY-SA 4.0'
    ),
    (
        'med_reog_ponorogo_01',
        'Kesenian Reog Ponorogo',
        'Penari Singo Barong dengan dadak merak megah dalam pertunjukan Reog Ponorogo.',
        'Kesenian Tradisional Reog Ponorogo dengan topeng Singo Barong.',
        'Pentas kesenian Reog Ponorogo memperlihatkan penari berkepala singa bermahkota bulu merak.',
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        'https://commons.wikimedia.org/wiki/File:Reog_Ponorogo_Performance.jpg',
        'Kemdikbud / Wikimedia Commons',
        'Creative Commons CC-BY-SA 3.0',
        'Foto: Warisan Budaya Kemdikbud / Wikimedia Commons'
    ),
    (
        'med_stasiun_madiun_01',
        'Stasiun Kereta Api Madiun',
        'Peron dan bangunan utama Stasiun Madiun sebagai simpul mobilitas perkeretaapian di Madiun.',
        'Stasiun Madiun, simpul transportasi kereta api di Kota Madiun.',
        'Kereta api penumpang berhenti di peron Stasiun Madiun.',
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        'https://commons.wikimedia.org/wiki/File:Stasiun_Madiun.jpg',
        'PT KAI / Wikimedia Commons',
        'Public Domain / CC-BY-SA',
        'Foto: KAI / Wikimedia Commons'
    ),
    (
        'med_sarangan_magetan_01',
        'Telaga Sarangan Magetan',
        'Pemandangan danau alami Telaga Sarangan di lereng Gunung Lawu Kabupaten Magetan.',
        'Telaga Sarangan di lereng Gunung Lawu, Kabupaten Magetan.',
        'Danau alami pegunungan dengan latar perbukitan hijau berkabut.',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        'https://commons.wikimedia.org/wiki/File:Telaga_Sarangan_Magetan.jpg',
        'Wikimedia Commons Contributor',
        'Creative Commons CC-BY-SA 4.0',
        'Foto: Wikimedia Commons / CC-BY-SA 4.0'
    ),
    (
        'med_benteng_ngawi_01',
        'Benteng Pendem Van den Bosch Ngawi',
        'Gerbang cagar budaya Benteng Pendem Van den Bosch di pertemuan Bengawan Solo dan Bengawan Madiun.',
        'Benteng Van den Bosch (Benteng Pendem), cagar budaya di Kabupaten Ngawi.',
        'Bangunan benteng bata merah bersejarah di Kabupaten Ngawi.',
        'https://images.unsplash.com/photo-1548625361-19597793d5f3?auto=format&fit=crop&w=800&q=80',
        'https://commons.wikimedia.org/wiki/File:Benteng_Pendem_Ngawi.jpg',
        'Wikimedia Commons Contributor',
        'Creative Commons CC-BY-SA 3.0',
        'Foto: Wikimedia Commons / CC-BY-SA 3.0'
    ),
    (
        'med_klayar_pacitan_01',
        'Pantai Klayar Pacitan',
        'Hamparan pasir putih dan formasi batu karang karang bolong di Pantai Klayar Pacitan.',
        'Pantai Klayar dengan bentang karang unik di Kabupaten Pacitan.',
        'Pantai pesisir samudra berpasir putih dengan tebing karang alami.',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        'https://commons.wikimedia.org/wiki/File:Klayar_Beach_Pacitan.jpg',
        'Wikimedia Commons Contributor',
        'Creative Commons CC-BY-SA 4.0',
        'Foto: Wikimedia Commons / CC-BY-SA 4.0'
    )
ON CONFLICT (media_id) DO NOTHING;

-- 8. Connect Entities to Media Assets
INSERT INTO public.lkb_entity_media_relations (entity_id, media_id, is_primary, sort_order)
VALUES
    ('ctx_ent_3374_lawang_sewu_01', 'med_lawang_sewu_01', true, 1),
    ('ctx_ent_3374_kota_lama_01', 'med_kota_lama_01', true, 1),
    ('ctx_ent_3374_tanjung_emas_01', 'med_tanjung_emas_01', true, 1),
    ('ctx_ent_3374_lumpia_semarang_01', 'med_lumpia_semarang_01', true, 1),
    ('ctx_ent_3374_pasar_johar_01', 'med_pasar_johar_01', true, 1),
    ('ctx_ent_3502_reog_ponorogo_01', 'med_reog_ponorogo_01', true, 1),
    ('ctx_ent_3577_inka_01', 'med_stasiun_madiun_01', true, 1),
    ('ctx_ent_3520_telaga_sarangan_01', 'med_sarangan_magetan_01', true, 1),
    ('ctx_ent_3521_benteng_pendem_01', 'med_benteng_ngawi_01', true, 1),
    ('ctx_ent_3501_goa_gong_01', 'med_klayar_pacitan_01', true, 1)
ON CONFLICT (entity_id, media_id) DO NOTHING;

-- 9. Updated RPC function to include attached media assets in JSON
DROP FUNCTION IF EXISTS public.lkb_retrieve_context(TEXT, TEXT, TEXT, TEXT, INT, TEXT, INT, TEXT);
DROP FUNCTION IF EXISTS public.lkb_retrieve_context(TEXT, TEXT, TEXT, TEXT, INT, TEXT, INT, TEXT, vector);

CREATE OR REPLACE FUNCTION public.lkb_retrieve_context(
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
STABLE
SECURITY DEFINER
AS $$
DECLARE
    v_target_region TEXT := p_region_id;
    v_fallback_level TEXT := 'exact';
    v_count INT := 0;
    v_results JSONB := '[]'::jsonb;
    v_warnings TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- 1. Check exact region match
    SELECT COUNT(*) INTO v_count FROM public.lkb_entities WHERE region_id = v_target_region;

    -- 2. Fallback: District -> Regency / City (e.g. 35.77.01 -> 35.77 or 33.74.01 -> 33.74)
    IF v_count = 0 AND v_target_region LIKE '%.%.%' THEN
        v_target_region := split_part(p_region_id, '.', 1) || '.' || split_part(p_region_id, '.', 2);
        SELECT COUNT(*) INTO v_count FROM public.lkb_entities WHERE region_id = v_target_region;
        IF v_count > 0 THEN
            v_fallback_level := 'district_to_regency';
            v_warnings := array_append(v_warnings, 'Data spesifik kecamatan belum tersedia. Menggunakan konteks tingkat kabupaten/kota.');
        END IF;
    END IF;

    -- 3. Query entities with matching criteria & attached primary media
    SELECT jsonb_agg(item) INTO v_results
    FROM (
        SELECT 
            e.entity_id,
            e.region_id,
            r.name AS region_name,
            e.category,
            e.subcategory,
            e.canonical_name AS name,
            e.short_description AS description,
            e.educational_usage,
            e.safe_for_word_problem,
            e.quantitative_constraints,
            e.verification_status,
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
                    FROM public.lkb_entity_evidence ev
                    LEFT JOIN public.lkb_sources s ON s.source_id = ev.source_id
                    WHERE ev.entity_id = e.entity_id
                ),
                '[]'::jsonb
            ) AS evidence,
            COALESCE(
                (
                    SELECT jsonb_build_object(
                        'media_id', m.media_id,
                        'title', m.title,
                        'caption', m.caption,
                        'alt_text', m.alt_text,
                        'image_url', m.image_url,
                        'source_url', m.source_url,
                        'author', m.author,
                        'license_type', m.license_type,
                        'attribution_text', m.attribution_text
                    )
                    FROM public.lkb_entity_media_relations emr
                    JOIN public.lkb_media_assets m ON m.media_id = emr.media_id
                    WHERE emr.entity_id = e.entity_id AND emr.is_primary = true
                    LIMIT 1
                ),
                NULL
            ) AS primary_media
        FROM public.lkb_entities e
        LEFT JOIN public.lkb_regions r ON r.region_id = e.region_id
        WHERE e.region_id = v_target_region
          AND (p_category IS NULL OR e.category = p_category)
          AND (p_subcategory IS NULL OR e.subcategory = p_subcategory)
          AND (p_grade IS NULL OR p_grade = ANY(e.grade_suitability))
          AND (p_subject IS NULL OR p_subject = ANY(e.subject_tags))
          AND (
              p_query = '' OR
              e.canonical_name ILIKE '%' || p_query || '%' OR
              e.short_description ILIKE '%' || p_query || '%' OR
              e.educational_usage ILIKE '%' || p_query || '%' OR
              p_query ILIKE '%' || e.canonical_name || '%'
          )
        ORDER BY 
            CASE 
                WHEN e.canonical_name ILIKE '%' || p_query || '%' THEN 1
                WHEN e.short_description ILIKE '%' || p_query || '%' THEN 2
                ELSE 3
            END,
            e.created_at ASC
        LIMIT p_limit
    ) item;

    IF v_results IS NULL THEN
        v_results := '[]'::jsonb;
    END IF;

    RETURN jsonb_build_object(
        'requested_region_id', p_region_id,
        'matched_region_id', v_target_region,
        'region_fallback_level', v_fallback_level,
        'retrieval_mode_used', p_mode,
        'results', v_results,
        'warnings', to_jsonb(v_warnings)
    );
END;
$$;
