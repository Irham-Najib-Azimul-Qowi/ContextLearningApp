import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
import FeatureCard from "@/components/ui/feature-card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Layers,
  Users,
  GraduationCap,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  FileQuestion,
  Calculator,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-indigo-100 selection:text-primary">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-20 sm:py-28 border-b border-border/40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(79,70,229,0.12),rgba(255,255,255,0))]" />

        <Container>
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-2 text-xs sm:text-sm font-semibold text-primary shadow-xs">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Local Contextual Learning Platform</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Pembelajaran Bermakna,{" "}
              <br className="hidden sm:inline" />
              Sesuai Karakteristik{" "}
              <span className="text-primary underline decoration-indigo-200 decoration-wavy decoration-2">
                Wilayah Siswa
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              ContextLearning membantu guru Sekolah Dasar menciptakan soal dan materi
              pembelajaran berbasis AI yang disesuaikan dengan bentang alam, mata pencaharian,
              komoditas, dan budaya lokal di sekitar lingkungan sekolah.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link href="/auth/login">
                <Button variant="primary" size="lg" className="shadow-md">
                  <GraduationCap className="h-5 w-5 mr-1" /> Mulai Sebagai Guru / Siswa
                </Button>
              </Link>

              <Link href="/teacher/questions/context-preview">
                <Button variant="outline" size="lg">
                  <Layers className="h-5 w-5 mr-1 text-primary" /> Coba Uji Kontekstualisasi
                </Button>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> Kurikulum SD (Kelas 1–6)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> Matematika, Bahasa Indonesia &amp; IPS
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> Validasi Pendidikan Otomatis
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* CORE INNOVATION PIPELINE SECTION */}
      <section id="kontekstual" className="py-20 bg-slate-50/60 border-b border-border/40">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Arsitektur Teknis
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Bukan Sekadar Wrapper Generative AI
            </h2>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              Kami membangun <strong>Contextual AI Engine</strong> terstruktur yang memadukan ekstraksi variabel, basis pengetahuan lokal, pemetaan deterministik, dan validasi matematika tanpa bergantung penuh pada LLM.
            </p>
          </div>

          {/* Pipeline Diagram Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Tahap 1</span>
                <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-primary">
                  <FileQuestion className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-base font-bold text-foreground">Pemahaman Soal</h3>
                <p className="mt-1.5 text-xs text-muted leading-relaxed">
                  Soal kurikulum dianalisis untuk memisahkan kompetensi matematika/bahasa dari variabel lingkungan.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 text-[11px] font-mono text-primary font-bold">
                Ekstraksi [VARIABEL]
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Tahap 2</span>
                <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-secondary">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-base font-bold text-foreground">Knowledge Base Lokal</h3>
                <p className="mt-1.5 text-xs text-muted leading-relaxed">
                  Mengambil entitas terverifikasi (sungai, pasar, komoditas, mata pencaharian) sesuai lokasi sekolah.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 text-[11px] font-mono text-secondary font-bold">
                Hierarki Wilayah Siswa
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-warning uppercase tracking-wider">Tahap 3</span>
                <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-warning">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-base font-bold text-foreground">Injeksi Konteks</h3>
                <p className="mt-1.5 text-xs text-muted leading-relaxed">
                  Substitusi cerdas menggantikan kata umum menjadi realitas sekitar siswa dengan tata bahasa alami.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 text-[11px] font-mono text-warning font-bold">
                Template Substitution
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-success uppercase tracking-wider">Tahap 4</span>
                <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-success">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-base font-bold text-foreground">Validasi Pendidikan</h3>
                <p className="mt-1.5 text-xs text-muted leading-relaxed">
                  Memastikan angka nominal, kunci jawaban, dan kompetensi soal tidak rusak sebelum disetujui guru.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 text-[11px] font-mono text-success font-bold">
                Persetujuan Guru
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FEATURES SECTION */}
      <section id="fitur" className="py-20 bg-white border-b border-border/40">
        <Container>
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Fitur Lengkap Platform
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Solusi Terintegrasi Guru &amp; Siswa
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              Semua alur pembelajaran kontekstual mulai dari bank soal, pembuatan materi, penyelenggaraan ujian, hingga penilaian otomatis.
            </p>
          </div>

          {/* Feature Cards with Lucide React Icons */}
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="AI Question Generator & Scanner"
              description="Hasilkan soal baru atau digitalkan lembar cetak fisik menggunakan Google Gemini secara terstruktur dalam format JSON dengan variabel konteks otomatis."
            />

            <FeatureCard
              icon={<Layers className="h-6 w-6" />}
              title="Pratinjau & Komparasi Kontekstual"
              description="Bandingkan langsung soal asli vs hasil adaptasi wilayah dengan penandaan warna, pilihan alternatif entitas lokal, dan kendali review penuh bagi guru."
            />

            <FeatureCard
              icon={<Calculator className="h-6 w-6" />}
              title="Validasi Matematika & Skoring Deterministic"
              description="Penilaian pilihan ganda diproses 100% pada server tanpa memanggil AI, menghemat biaya kuota dan menjaga akurasi hitungan matematika."
            />

            <FeatureCard
              icon={<BookOpen className="h-6 w-6" />}
              title="Materi Ajar Kontekstual"
              description="Susun bahan ajar yang menceritakan fenomena alam dan kegiatan ekonomi lokal siswa, sehingga pelajaran menjadi lebih mudah dipahami dan berkesan."
            />

            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Manajemen Kelas & Kode Gabung"
              description="Guru dapat membuat rombongan belajar dengan kode gabung unik yang memudahkan siswa sekolah dasar masuk tanpa prosedur rumit."
            />

            <FeatureCard
              icon={<GraduationCap className="h-6 w-6" />}
              title="Ruang Ujian Aman & Anti-Bocor"
              description="Naskah soal bagi siswa diproyeksikan secara aman tanpa menyertakan kunci jawaban, dilengkapi autosave jawaban dan pembatasan waktu ujian."
            />
          </div>
        </Container>
      </section>

      {/* ABOUT POLNES HACKATHON SECTION */}
      <section id="tentang" className="py-20 bg-slate-50/50">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Tentang ContextLearning
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Menghubungkan Kurikulum dengan Realitas Siswa
            </h2>
            <p className="text-sm leading-relaxed text-muted">
              ContextLearning dikembangkan sebagai purwarupa inovatif untuk <strong>IT Competition POLNES</strong>.
              Kami percaya bahwa pemahaman konsep abstrak pada siswa Sekolah Dasar akan meningkat drastis ketika contoh soal yang mereka kerjakan mencerminkan lingkungan yang mereka lihat setiap hari di sekitarnya.
            </p>
            <p className="text-sm leading-relaxed text-muted">
              Fokus purwarupa ini mencakup mata pelajaran <strong>Matematika</strong>, <strong>Bahasa Indonesia</strong>, dan <strong>IPS</strong> dengan demonstrasi wilayah pesisir perairan Samarinda (Kalimantan Timur) dan agraris lereng Merapi Sleman (DI Yogyakarta).
            </p>

            <div className="pt-6">
              <Link href="/auth/login">
                <Button variant="primary" size="md">
                  Coba Purwarupa Sekarang <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-white py-8">
        <Container>
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-foreground">
                Context<span className="text-primary">Learning</span>
              </span>
            </div>

            <p className="text-xs text-muted">
              Prototype IT Competition POLNES • 2026
            </p>
          </div>
        </Container>
      </footer>
    </main>
  );
}