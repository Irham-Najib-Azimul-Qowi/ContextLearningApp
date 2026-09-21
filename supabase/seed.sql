-- ContextLearning Seed Data
-- 2 Distinct Indonesian Regions:
-- 1) Samarinda & Mahakam Basin, Kalimantan Timur (Sungai Mahakam, Kapal Klotok, Tambang Batu Bara, Tenun Samarinda, Pasar Pagi)
-- 2) Sleman & Kota Yogyakarta, DI Yogyakarta (Gunung Merapi, Candi Prambanan, Petani Salak Pondoh, Batik Tulis, Trans Jogja)

-- REGIONS
INSERT INTO public.regions (id, province, regency, district, village, geographical_summary, economic_summary, cultural_summary)
VALUES
(
  'e29b12a8-1234-4b5c-8901-000000000001',
  'Kalimantan Timur',
  'Kota Samarinda',
  'Samarinda Kota',
  'Pasar Pagi',
  'Wilayah dataran rendah di tepi Sungai Mahakam dengan perbukitan di sekelilingnya. Memiliki ekosistem perairan sungai besar yang menjadi urat nadi perhubungan.',
  'Perekonomian bertumpu pada perdagangan pasar tradisional, pelabuhan sungai, industri kerajinan kain tenun, serta logistik energi dan perkebunan.',
  'Masyarakat multikultural dengan tradisi pesisir Mahakam, festival budaya Sungai Mahakam, serta kearifan lokal dalam menjaga kebersihan sungai.'
),
(
  'e29b12a8-1234-4b5c-8901-000000000002',
  'DI Yogyakarta',
  'Kabupaten Sleman',
  'Pakem',
  'Pakembinangun',
  'Wilayah lereng selatan Gunung Merapi dengan tanah vulkanik subur, hawa sejuk, dan aliran sungai-sungai berhulu dari puncak Merapi.',
  'Pertanian hortikultura terutama buah salak pondoh, peternakan sapi perah, agrowisata pedesaan, dan kerajinan batik.',
  'Kental dengan filosofi Jawa, gotong royong sambatan di pedesaan, upacara adat labuhan Merapi, dan pelestarian kesenian karawitan.'
)
ON CONFLICT (id) DO NOTHING;

-- SCHOOLS
INSERT INTO public.schools (id, name, address, province, regency, district, village, region_id, description, local_characteristics)
VALUES
(
  'f11a22b3-0000-4444-8888-000000000001',
  'SD Negeri 001 Samarinda Kota',
  'Jl. Jenderal Sudirman No. 12, Samarinda',
  'Kalimantan Timur',
  'Kota Samarinda',
  'Samarinda Kota',
  'Pasar Pagi',
  'e29b12a8-1234-4b5c-8901-000000000001',
  'Sekolah dasar percontohan yang terletak di dekat kawasan tepian Sungai Mahakam dan pusat perdagangan Pasar Pagi.',
  'Mayoritas orang tua siswa berprofesi sebagai pedagang pasar, penyedia jasa transportasi air kapal klotok, nelayan sungai, dan perajin tenun.'
),
(
  'f11a22b3-0000-4444-8888-000000000002',
  'SD Negeri Pakem 1 Sleman',
  'Jl. Kaliurang Km. 17, Sleman',
  'DI Yogyakarta',
  'Kabupaten Sleman',
  'Pakem',
  'Pakembinangun',
  'e29b12a8-1234-4b5c-8901-000000000002',
  'Sekolah ramah anak berbasis kearifan agraris di kaki Gunung Merapi.',
  'Lingkungan sekolah dikelilingi kebun salak pondoh dan area persawahan bertingkat.'
)
ON CONFLICT (id) DO NOTHING;

-- LOCAL KNOWLEDGE BASE ENTRIES (Samarinda - Kaltim)
INSERT INTO public.local_knowledge_base (region_id, entity_category, entity_name, description, suitability_notes, verification_status)
VALUES
-- Geography
('e29b12a8-1234-4b5c-8901-000000000001', 'geography', 'Sungai Mahakam', 'Sungai terpanjang kedua di Indonesia yang melintasi Kota Samarinda, habitat pesut mahakam.', 'Sangat cocok untuk soal pengukuran panjang, debit air, dan ekosistem perairan.', 'verified'),
('e29b12a8-1234-4b5c-8901-000000000001', 'geography', 'Danau Melintang', 'Danau air tawar di pedalaman DAS Mahakam penghasil ikan tawar.', 'Cocok untuk materi rantai makanan dan mata pencaharian nelayan.', 'verified'),
-- Infrastructure
('e29b12a8-1234-4b5c-8901-000000000001', 'infrastructure', 'Jembatan Mahakam', 'Jembatan rangka baja pertama yang menghubungkan Samarinda Kota dengan Samarinda Seberang.', 'Cocok untuk soal jarak, waktu tempuh, dan sejarah pembangunan kota.', 'verified'),
('e29b12a8-1234-4b5c-8901-000000000001', 'infrastructure', 'Pasar Pagi Samarinda', 'Pasar tradisional tertua di tepi Mahakam tempat perdagangan sayur, ikan, dan sembako.', 'Sangat cocok untuk soal aritmetika jual-beli dan interaksi ekonomi.', 'verified'),
('e29b12a8-1234-4b5c-8901-000000000001', 'infrastructure', 'Pasar Segiri', 'Pasar induk sayur-mayur dan buah terbesar di Kota Samarinda.', 'Cocok untuk soal aritmetika timbangan dan distribusi komoditas.', 'verified'),
-- Economy
('e29b12a8-1234-4b5c-8901-000000000001', 'economy', 'Ikan Haruan (Gabus)', 'Komoditas perikanan air tawar utama dari Sungai Mahakam yang banyak diolah menjadi kuliner lokal.', 'Cocok untuk soal berat komoditas, harga jual, dan gizi hewani.', 'verified'),
('e29b12a8-1234-4b5c-8901-000000000001', 'economy', 'Kain Tenun Belang Hatta', 'Kerajinan tenun khas Samarinda Seberang dengan motif kotak-kotak tradisional.', 'Cocok untuk geometri motif, pola bilangan, dan materi seni rupa daerah.', 'verified'),
('e29b12a8-1234-4b5c-8901-000000000001', 'economy', 'Perajin Amplang Ikan', 'Pekerjaan memproduksi kerupuk gurih khas berbahan dasar ikan pipih atau belida.', 'Cocok untuk soal wirausaha lokal dan rasio bahan produksi.', 'verified'),
-- Transportation
('e29b12a8-1234-4b5c-8901-000000000001', 'transportation', 'Kapal Klotok', 'Perahu motor kayu tradisional yang melayani penyeberangan warga di Sungai Mahakam.', 'Sangat tepat untuk soal kecepatan, waktu penyeberangan, dan transportasi sungai.', 'verified'),
('e29b12a8-1234-4b5c-8901-000000000001', 'transportation', 'Kapal Feri Penyeberangan', 'Kapal pengangkut penumpang dan kendaraan roda dua lintas sungai.', 'Cocok untuk soal kapasitas muatan.', 'verified'),
-- Social & Culture
('e29b12a8-1234-4b5c-8901-000000000001', 'social', 'Gotong Royong Bebaras', 'Tradisi membersihkan lingkungan pemukiman panggung di bantaran sungai.', 'Cocok untuk soal PPKn dan kerjasama sosial.', 'verified'),
('e29b12a8-1234-4b5c-8901-000000000001', 'culture', 'Festival Mahakam', 'Pagelaran budaya tahunan perlombaan dayung perahu naga dan parade tari perahu hias.', 'Cocok untuk teks pemahaman membaca dan soal hitung waktu lomba.', 'verified');

-- LOCAL KNOWLEDGE BASE ENTRIES (Sleman/Yogyakarta)
INSERT INTO public.local_knowledge_base (region_id, entity_category, entity_name, description, suitability_notes, verification_status)
VALUES
-- Geography
('e29b12a8-1234-4b5c-8901-000000000002', 'geography', 'Gunung Merapi', 'Gunung api aktif di perbatasan Sleman dan Jawa Tengah yang menyuburkan lahan pertanian sekitarnya.', 'Cocok untuk materi bentang alam, letusan vulkanik, dan siklus air.', 'verified'),
('e29b12a8-1234-4b5c-8901-000000000002', 'geography', 'Kali Code', 'Sungai yang mengalir dari lereng Merapi membelah perkotaan Yogyakarta.', 'Cocok untuk materi hidrologi dan mitigasi banjir lahar dingin.', 'verified'),
-- Infrastructure
('e29b12a8-1234-4b5c-8901-000000000002', 'infrastructure', 'Pasar Beringharjo', 'Pasar tradisional legendaris di jantung Yogyakarta pusat perdagangan kain batik dan jamu.', 'Sangat cocok untuk soal jual beli dan interaksi sosial budaya.', 'verified'),
('e29b12a8-1234-4b5c-8901-000000000002', 'infrastructure', 'Candi Prambanan', 'Kompleks percandian Hindu megah di perbatasan Sleman dan Klaten.', 'Cocok untuk materi sejarah peninggalan budaya dan geometri bidang datar.', 'verified'),
-- Economy
('e29b12a8-1234-4b5c-8901-000000000002', 'economy', 'Salak Pondoh Sleman', 'Komoditas buah unggulan lereng Merapi berasa manis segar renyah.', 'Sangat cocok untuk soal hitungan berat, kemasan keranjang, dan keuntungan panen.', 'verified'),
('e29b12a8-1234-4b5c-8901-000000000002', 'economy', 'Petani Susu Sapi Perah Kaliurang', 'Mata pencaharian peternak sapi perah di dataran tinggi lereng Merapi.', 'Cocok untuk perhitungan volume liter susu dan koperasi peternak.', 'verified'),
('e29b12a8-1234-4b5c-8901-000000000002', 'economy', 'Pengrajin Batik Tulis', 'Pekerjaan membatik kain dengan canting dan malam bernilai seni tinggi.', 'Cocok untuk soal pola simetri dan kerajinan daerah.', 'verified'),
-- Transportation
('e29b12a8-1234-4b5c-8901-000000000002', 'transportation', 'Andong Tradisional', 'Kereta beroda empat bertenaga kuda yang menjadi sarana transportasi ramah lingkungan.', 'Cocok untuk soal tarif perjalanan, jarak tempuh, dan budaya transportasi.', 'verified'),
('e29b12a8-1234-4b5c-8901-000000000002', 'transportation', 'Trans Jogja', 'Bus perkotaan ber-halte tinggi dengan rute antar-kecamatan di Yogyakarta dan Sleman.', 'Cocok untuk jadwal kedatangan bus dan kapasitas penumpang.', 'verified'),
-- Social & Culture
('e29b12a8-1234-4b5c-8901-000000000002', 'social', 'Ronda Malam & Sambatan', 'Kegiatan gotong royong warga desa membangun rumah atau memanen sawah.', 'Cocok untuk nilai persatuan dan soal alokasi jam kerja kelompok.', 'verified'),
('e29b12a8-1234-4b5c-8901-000000000002', 'culture', 'Tradisi Sekaten & Gunungan', 'Perayaan peringatan Maulid Nabi dengan iring-iringan gunungan hasil bumi.', 'Cocok untuk materi IPS keberagaman budaya dan pemahaman teks narasi.', 'verified');
