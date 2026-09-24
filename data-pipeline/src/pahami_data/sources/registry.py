"""
Curated Legal Source Registry with Provenance, License Tracking, and Attrition Notes
"""

from typing import Dict, List, Optional
from pahami_data.schemas.models import SourceRecord

SOURCE_REGISTRY: Dict[str, SourceRecord] = {
    "src_bps_kota_madiun_2024": SourceRecord(
        source_id="src_bps_kota_madiun_2024",
        publisher="Badan Pusat Statistik (BPS) Kota Madiun",
        title="Kota Madiun Dalam Angka 2024",
        url="https://madiunkota.bps.go.id/publication/2024/02/28/kota-madiun-dalam-angka-2024.html",
        published_at="2024-02-28",
        retrieved_at="2026-09-23",
        license="Open Government Data / BPS Public License",
        attribution_note="Sumber data statistik resmi BPS Kota Madiun.",
        import_mode="manual_curated"
    ),
    "src_pemkot_madiun_official": SourceRecord(
        source_id="src_pemkot_madiun_official",
        publisher="Pemerintah Kota Madiun",
        title="Profil Wilayah dan Potensi Unggulan Kota Madiun",
        url="https://madiunkota.go.id",
        published_at="2024-01-15",
        retrieved_at="2026-09-23",
        license="Public Domain Government Portal",
        attribution_note="Informasi resmi publik Pemerintah Kota Madiun.",
        import_mode="manual_curated"
    ),
    "src_pt_inka_official": SourceRecord(
        source_id="src_pt_inka_official",
        publisher="PT Industri Kereta Api (Persero) Madiun",
        title="Profil Perusahaan dan Sejarah Manufaktur Perkeretaapian",
        url="https://www.inka.co.id/profil",
        published_at="2024-03-01",
        retrieved_at="2026-09-23",
        license="Corporate Public Profile",
        attribution_note="Keterangan resmi profil manufaktur PT INKA Madiun.",
        import_mode="manual_curated"
    ),
    "src_bps_kab_madiun_2024": SourceRecord(
        source_id="src_bps_kab_madiun_2024",
        publisher="Badan Pusat Statistik (BPS) Kabupaten Madiun",
        title="Kabupaten Madiun Dalam Angka 2024",
        url="https://madiunkab.bps.go.id/publication/2024/02/28/kabupaten-madiun-dalam-angka-2024.html",
        published_at="2024-02-28",
        retrieved_at="2026-09-23",
        license="Open Government Data / BPS Public License",
        attribution_note="Statistik pertanian, perkebunan porang, dan industri Kabupaten Madiun.",
        import_mode="manual_curated"
    ),
    "src_bps_kab_ngawi_2024": SourceRecord(
        source_id="src_bps_kab_ngawi_2024",
        publisher="Badan Pusat Statistik (BPS) Kabupaten Ngawi",
        title="Kabupaten Ngawi Dalam Angka 2024",
        url="https://ngawikab.bps.go.id/publication/2024/02/28/kabupaten-ngawi-dalam-angka-2024.html",
        published_at="2024-02-28",
        retrieved_at="2026-09-23",
        license="Open Government Data / BPS Public License",
        attribution_note="Data statistik produksi pertanian, kehutanan jati, dan cagar budaya Ngawi.",
        import_mode="manual_curated"
    ),
    "src_bps_kab_magetan_2024": SourceRecord(
        source_id="src_bps_kab_magetan_2024",
        publisher="Badan Pusat Statistik (BPS) Kabupaten Magetan",
        title="Kabupaten Magetan Dalam Angka 2024",
        url="https://magetankab.bps.go.id/publication/2024/02/28/kabupaten-magetan-dalam-angka-2024.html",
        published_at="2024-02-28",
        retrieved_at="2026-09-23",
        license="Open Government Data / BPS Public License",
        attribution_note="Data peternakan sapi perah, pariwisata Sarangan, dan kerajinan kulit Magetan.",
        import_mode="manual_curated"
    ),
    "src_bps_kab_ponorogo_2024": SourceRecord(
        source_id="src_bps_kab_ponorogo_2024",
        publisher="Badan Pusat Statistik (BPS) Kabupaten Ponorogo",
        title="Kabupaten Ponorogo Dalam Angka 2024",
        url="https://ponorogokab.bps.go.id/publication/2024/02/28/kabupaten-ponorogo-dalam-angka-2024.html",
        published_at="2024-02-28",
        retrieved_at="2026-09-23",
        license="Open Government Data / BPS Public License",
        attribution_note="Data kebudayaan reog, pertanian jagung, dan pariwisata Telaga Ngebel.",
        import_mode="manual_curated"
    ),
    "src_bps_kab_pacitan_2024": SourceRecord(
        source_id="src_bps_kab_pacitan_2024",
        publisher="Badan Pusat Statistik (BPS) Kabupaten Pacitan",
        title="Kabupaten Pacitan Dalam Angka 2024",
        url="https://pacitankab.bps.go.id/publication/2024/02/28/kabupaten-pacitan-dalam-angka-2024.html",
        published_at="2024-02-28",
        retrieved_at="2026-09-23",
        license="Open Government Data / BPS Public License",
        attribution_note="Data perikanan tangkap Tamperan, bentang karst goa, dan pariwisata pantai.",
        import_mode="manual_curated"
    ),
    "src_osm_geodata": SourceRecord(
        source_id="src_osm_geodata",
        publisher="OpenStreetMap Contributors",
        title="OpenStreetMap Geographical POI and Transport Infrastructure",
        url="https://www.openstreetmap.org",
        published_at="2026-01-01",
        retrieved_at="2026-09-23",
        license="Open Database License (ODbL) 1.0",
        attribution_note="© OpenStreetMap contributors. Data spasial dan fasilitas publik.",
        import_mode="curated_extraction"
    ),
    "src_kemdikbud_cagar_budaya": SourceRecord(
        source_id="src_kemdikbud_cagar_budaya",
        publisher="Direktorat Pelindungan Kebudayaan, Kemendikbudristek",
        title="Sistem Registrasi Nasional Cagar Budaya & Warisan Budaya Takbenda",
        url="https://kebudayaan.kemdikbud.go.id/warisan-budaya",
        published_at="2023-11-20",
        retrieved_at="2026-09-23",
        license="Kementerian Kebudayaan Open Access",
        attribution_note="Data registrasi warisan budaya nasional dan cagar budaya Karesidenan Madiun.",
        import_mode="manual_curated"
    ),
    "src_bps_kota_semarang_2024": SourceRecord(
        source_id="src_bps_kota_semarang_2024",
        publisher="Badan Pusat Statistik (BPS) Kota Semarang",
        title="Kota Semarang Dalam Angka 2024",
        url="https://semarangkota.bps.go.id/publication/2024/02/28/kota-semarang-dalam-angka-2024.html",
        published_at="2024-02-28",
        retrieved_at="2026-09-24",
        license="Open Government Data / BPS Public License",
        attribution_note="Data statistik perekonomian, industri, mobilitas maritim, dan perdagangan Kota Semarang.",
        import_mode="manual_curated"
    ),
    "src_pemkot_semarang_official": SourceRecord(
        source_id="src_pemkot_semarang_official",
        publisher="Pemerintah Kota Semarang & Satu Data Semarang",
        title="Portal Informasi & Satu Data Kota Semarang",
        url="https://data.semarangkota.go.id",
        published_at="2024-03-10",
        retrieved_at="2026-09-24",
        license="Public Domain Government Portal",
        attribution_note="Portal data resmi Pemerintah Kota Semarang mengenai sarana publik dan cagar budaya.",
        import_mode="manual_curated"
    ),
    "src_pelabuhan_tanjung_emas": SourceRecord(
        source_id="src_pelabuhan_tanjung_emas",
        publisher="PT Pelabuhan Indonesia (Persero) Regional 3",
        title="Profil Pelabuhan Tanjung Emas Semarang",
        url="https://pelindo.co.id/fasilitas-pelabuhan/tanjung-emas",
        published_at="2024-01-20",
        retrieved_at="2026-09-24",
        license="Corporate Public Profile",
        attribution_note="Profil fasilitas logistik, bongkar muat peti kemas, dan terminal penumpang Tanjung Emas.",
        import_mode="manual_curated"
    ),
    "src_wikimedia_commons_semarang": SourceRecord(
        source_id="src_wikimedia_commons_semarang",
        publisher="Wikimedia Commons Contributors",
        title="Wikimedia Commons Educational Media Repository",
        url="https://commons.wikimedia.org",
        published_at="2026-01-01",
        retrieved_at="2026-09-24",
        license="Creative Commons Attribution-ShareAlike (CC-BY-SA 3.0 / 4.0 / Public Domain)",
        attribution_note="Foto dokumentasi cagar budaya dan sarana transportasi publik dengan atribusi resmi.",
        import_mode="curated_extraction"
    )
}


def get_source(source_id: str) -> Optional[SourceRecord]:
    return SOURCE_REGISTRY.get(source_id)


def list_sources() -> List[SourceRecord]:
    return list(SOURCE_REGISTRY.values())
