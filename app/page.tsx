import Link from "next/link";
import { FileQuestion, BookOpen, Sparkles, MapPin, ArrowRight, ShieldCheck, UserCheck, GraduationCap } from "lucide-react";

export default function HomePage() {
  const regions = [
    { code: "35.77", name: "Kota Madiun", desc: "Pusat industri perkeretaapian & kuliner pecel" },
    { code: "35.19", name: "Kabupaten Madiun", desc: "Sentra perkebunan porang Saradan & Waduk Bening" },
    { code: "35.21", name: "Kabupaten Ngawi", desc: "Benteng Pendem Van den Bosch & komoditas kayu jati" },
    { code: "35.20", name: "Kabupaten Magetan", desc: "Kaki Gunung Lawu, Telaga Sarangan & kerajinan kulit" },
    { code: "35.02", name: "Kabupaten Ponorogo", desc: "Seni adiluhung Reog Ponorogo & Telaga Ngebel" },
    { code: "35.01", name: "Kabupaten Pacitan", desc: "Pesisir samudra selatan, Pantai Klayar & Goa Gong" },
    { code: "33.74", name: "Kota Semarang", desc: "Lawang Sewu, Kota Lama, Pelabuhan Tanjung Emas & Pasar Johar" },
  ];

  return (
    <main className="min-h-screen bg-[#FAF7F3] text-[#23212A] flex flex-col justify-between p-6 sm:p-10 md:p-16">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header Navigation Bar */}
        <nav className="flex items-center justify-between pb-8 border-b border-[#E9E5E8] mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#51465B] flex items-center justify-center text-white font-extrabold shadow-sm">
              <span className="text-xl tracking-tighter">P</span>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-[#51465B]">PAHAMI</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FFD36D]/30 text-[#51465B] border border-[#FFD36D]/60">
                V2 Prototype
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-[#51465B] hover:text-[#23212A] px-4 py-2 rounded-xl hover:bg-[#51465B]/5 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/student/exam-access"
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white border border-[#E9E5E8] text-[#51465B] hover:border-[#F47D83] transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <GraduationCap className="w-4 h-4 text-[#F47D83]" />
              <span>Akses Ujian Murid</span>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#51465B]/10 text-[#51465B] text-xs font-bold tracking-wide mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#F47D83]" />
            <span>AI Pembelajaran Kontekstual Kelas 5 SD</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#23212A] mb-4 leading-tight">
            Pembelajaran yang dekat dengan lingkungan siswa.
          </h1>
          <p className="text-base sm:text-xl text-[#756F7A] font-normal leading-relaxed">
            Buat soal dan materi yang disesuaikan dengan karakteristik wilayah sekolah menggunakan AI.
          </p>
        </header>

        {/* The Two Primary Cards: Konteks Soal vs Konteks Materi */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Card Kiri: KONTEKS SOAL */}
          <Link
            href="/login?intent=question"
            className="group relative flex flex-col justify-between p-8 rounded-3xl bg-white border-2 border-[#E9E5E8] hover:border-[#51465B] shadow-sm hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 text-left"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#51465B] text-white flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-md">
                <FileQuestion className="w-7 h-7 text-[#FFD36D]" />
              </div>
              <div className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#F47D83] mb-1">
                Alur Utama 1
              </div>
              <h2 className="text-2xl font-black text-[#23212A] mb-3 group-hover:text-[#51465B] transition-colors">
                KONTEKS SOAL
              </h2>
              <p className="text-sm sm:text-base text-[#756F7A] leading-relaxed mb-6">
                Buat atau sesuaikan soal berdasarkan lingkungan lokal siswa. Dilengkapi gambar pendukung visual, validasi integritas matematika, dan ekspor lembar cetak A4.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E9E5E8] flex items-center justify-between text-sm font-bold text-[#51465B] group-hover:text-[#F47D83]">
              <span>Mulai Buat Soal Kontekstual</span>
              <div className="w-8 h-8 rounded-full bg-[#FAF7F3] flex items-center justify-center group-hover:bg-[#F47D83] group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card Kanan: KONTEKS MATERI */}
          <Link
            href="/login?intent=material"
            className="group relative flex flex-col justify-between p-8 rounded-3xl bg-white border-2 border-[#E9E5E8] hover:border-[#51465B] shadow-sm hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 text-left"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#51465B] text-white flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-md">
                <BookOpen className="w-7 h-7 text-[#F47D83]" />
              </div>
              <div className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#51465B] mb-1">
                Alur Utama 2
              </div>
              <h2 className="text-2xl font-black text-[#23212A] mb-3 group-hover:text-[#51465B] transition-colors">
                KONTEKS MATERI
              </h2>
              <p className="text-sm sm:text-base text-[#756F7A] leading-relaxed mb-6">
                Buat atau sesuaikan materi pembelajaran menggunakan konteks wilayah. Memperkaya modul ajar dengan contoh kegiatan ekonomi, budaya, dan sarana daerah nyata.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E9E5E8] flex items-center justify-between text-sm font-bold text-[#51465B] group-hover:text-[#F47D83]">
              <span>Mulai Buat Materi Kontekstual</span>
              <div className="w-8 h-8 rounded-full bg-[#FAF7F3] flex items-center justify-center group-hover:bg-[#F47D83] group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </section>

        {/* Regional Focus Showcase */}
        <section className="p-8 rounded-3xl bg-white border border-[#E9E5E8] mb-12 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-[#23212A] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#F47D83]" />
                <span>Cakupan Basis Pengetahuan Lokal Terverifikasi</span>
              </h3>
              <p className="text-xs text-[#756F7A] mt-0.5">
                Karesidenan Madiun (Jawa Timur) & Kota Semarang (Jawa Tengah)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#51465B] bg-[#FAF7F3] px-3 py-1.5 rounded-full border border-[#E9E5E8]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>BPS & Cagar Budaya Terverifikasi</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {regions.map((reg) => (
              <div
                key={reg.code}
                className="p-3.5 rounded-2xl bg-[#FAF7F3]/70 border border-[#E9E5E8] hover:border-[#51465B]/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm text-[#23212A]">{reg.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#756F7A] border border-[#E9E5E8]">
                    {reg.code}
                  </span>
                </div>
                <p className="text-xs text-[#756F7A] line-clamp-2">{reg.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Demo Shortcuts for Hackathon Evaluation */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#51465B]/5 border border-[#51465B]/10 text-xs text-[#51465B]">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#51465B]" />
            <span className="font-semibold">Evaluasi Cepat Tim Juri:</span>
            <span className="text-[#756F7A]">Akses langsung demo tanpa kredensial OAuth eksternal</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/teacher/dashboard"
              className="px-3 py-1.5 rounded-xl bg-[#51465B] text-white font-bold hover:bg-[#3E3547] transition-colors"
            >
              Demo Guru SD
            </Link>
            <Link
              href="/student/dashboard"
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E9E5E8] font-bold text-[#51465B] hover:border-[#51465B] transition-colors"
            >
              Demo Murid SD
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-[#E9E5E8] text-center text-xs text-[#756F7A]">
        PAHAMI V2 — Hackathon IT Comp 2026. Pembelajaran Kontekstual Berbasis AI & Local Knowledge Base.
      </footer>
    </main>
  );
}