import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
import FeatureCard from "@/components/ui/feature-card";
import { Button } from "@/components/ui/button";
import {
  Layers,
  GraduationCap,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  FileQuestion,
  Calculator,
  Users,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="py-16 sm:py-24 border-b border-border bg-surface">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            {/* Context Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-border bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Platform Adaptasi Soal &amp; Materi Berbasis Konteks Wilayah</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.15]">
              Pembelajaran Bermakna Sesuai Karakteristik Wilayah Siswa
            </h1>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-secondary">
              ContextLearning membantu guru mengadaptasi soal dan bahan ajar berbasis kurikulum ke dalam realitas lingkungan sekitar siswa—bentang alam, komoditas lokal, mata pencaharian, dan budaya setempat—dengan validasi matematika deterministik.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/auth/login">
                <Button variant="primary" size="lg">
                  <GraduationCap className="h-4 w-4 mr-1.5" /> Masuk Sebagai Guru / Siswa
                </Button>
              </Link>

              <Link href="/teacher/questions/generator">
                <Button variant="outline" size="lg">
                  <Layers className="h-4 w-4 mr-1.5 text-primary" /> Buka Generator Konteks
                </Button>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-secondary font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> Kurikulum Nasional Terpadu
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> Multi-Tenant Sekolah Terisolasi
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> Validasi Matematika Otomatis
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* CONCRETE REALITY COMPARISON SECTION */}
      <section className="py-16 border-b border-border bg-workspace">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Contoh Adaptasi Kontekstual Nyata
            </span>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Satu Soal Kurikulum, Berakar di Lingkungan Siswa
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-secondary leading-relaxed">
              Mempertahankan esensi kompetensi dan nilai hitungan matematika, sambil menghubungkan narasinya dengan ekosistem lokal siswa.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Standard Question */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <span className="text-xs font-bold text-muted uppercase tracking-wider">
                  Soal Standar Buku Teks (Umum)
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-surface-subtle border border-border text-secondary">
                  Konteks Generik
                </span>
              </div>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                &ldquo;Seorang petani di lereng bukit memanen <strong>24 karung gandum</strong>. Jika setiap karung dijual seharga <strong>Rp 150.000</strong> ke pedagang grosir di kota, berapakah total hasil penjualan petani tersebut?&rdquo;
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
                <span>Variabel: Karung gandum, bukit, grosir</span>
                <span className="font-mono font-bold text-secondary">Kunci: Rp 3.600.000</span>
              </div>
            </div>

            {/* Contextualized Question */}
            <div className="rounded-xl border-2 border-primary/40 bg-surface p-5 shadow-2xs relative">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Hasil Adaptasi ContextLearning
                  </span>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  SDN 001 Samarinda · Pesisir Mahakam
                </span>
              </div>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                &ldquo;Pak Syahril seorang nelayan keramba di <strong>Sungai Mahakam</strong> memanen <strong>24 keranjang ikan patin</strong>. Jika setiap keranjang dijual seharga <strong>Rp 150.000</strong> di <strong>Pasar Pagi Samarinda</strong>, berapakah total hasil penjualan Pak Syahril?&rdquo;
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-primary font-semibold">
                <span>Variabel: Sungai Mahakam, Ikan Patin, Pasar Pagi</span>
                <span className="font-mono font-bold text-success">Kunci: Rp 3.600.000 (Preserved)</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CORE INNOVATION PIPELINE SECTION */}
      <section id="kontekstual" className="py-16 bg-surface border-b border-border">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Alur Rekayasa Kontekstual
            </span>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Arsitektur Multi-Tahap Deterministic &amp; AI
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-secondary leading-relaxed">
              Memadukan ekstraksi variabel, basis pengetahuan wilayah, substitusi terarah, dan verifikasi integritas matematika sebelum disetujui guru.
            </p>
          </div>

          {/* Pipeline Diagram Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Tahap 1</span>
                <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileQuestion className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-foreground">Ekstraksi Variabel</h3>
                <p className="mt-1.5 text-xs text-secondary leading-relaxed">
                  Menganalisis soal untuk mengisolasi kompetensi matematika dan tata bahasa dari entitas lingkungan.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border text-[11px] font-mono text-primary font-semibold">
                Variabel: [ENTITAS]
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Tahap 2</span>
                <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-foreground">Knowledge Base Lokal</h3>
                <p className="mt-1.5 text-xs text-secondary leading-relaxed">
                  Mengambil entitas faktual terverifikasi (sungai, pasar, komoditas, kebiasaan warga) sesuai wilayah sekolah.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border text-[11px] font-mono text-secondary font-semibold">
                Database Geografi Siswa
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-warning uppercase tracking-wider">Tahap 3</span>
                <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg bg-warning-subtle text-warning">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-foreground">Substitusi Cerdas</h3>
                <p className="mt-1.5 text-xs text-secondary leading-relaxed">
                  Menyisipkan konteks baru dengan tata bahasa alami tanpa mengubah struktur logika soal.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border text-[11px] font-mono text-warning font-semibold">
                Natural Adaptation
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-success uppercase tracking-wider">Tahap 4</span>
                <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg bg-success-subtle text-success">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-foreground">Validasi Pendidikan</h3>
                <p className="mt-1.5 text-xs text-secondary leading-relaxed">
                  Memastikan angka nominal, kunci jawaban, dan kesesuaian materi tetap akurat sebelum disetujui guru.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border text-[11px] font-mono text-success font-semibold">
                Validasi Guru Mandiri
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FEATURES SECTION */}
      <section id="fitur" className="py-16 bg-workspace border-b border-border">
        <Container>
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Kapabilitas Platform
            </span>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Solusi Terpadu Guru &amp; Siswa
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm text-secondary leading-relaxed">
              Pengelolaan menyeluruh mulai dari bank soal, pembuatan materi lokal, penyelenggaraan ujian bebas distraksi, hingga penilaian terpusat.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <FeatureCard
              icon={<Sparkles className="h-5 w-5" />}
              title="Generator & Pemindai Soal AI"
              description="Hasilkan naskah soal terstruktur dalam format JSON dengan ekstraksi variabel konteks otomatis menggunakan model Google Gemini."
            />

            <FeatureCard
              icon={<Layers className="h-5 w-5" />}
              title="Pratinjau & Diff Kontekstual"
              description="Bandingkan langsung soal kurikulum asli vs adaptasi wilayah dengan penandaan visual, opsi entitas alternatif, dan kendali review penuh bagi guru."
            />

            <FeatureCard
              icon={<Calculator className="h-5 w-5" />}
              title="Skoring Matematika Deterministik"
              description="Penilaian pilihan ganda diproses pada server tanpa biaya token AI, memastikan akurasi kunci jawaban 100% konsisten."
            />

            <FeatureCard
              icon={<BookOpen className="h-5 w-5" />}
              title="Bahan Ajar Kontekstual"
              description="Susun materi ajar yang menceritakan bentang alam dan aktivitas masyarakat sekitar sekolah untuk pembelajaran yang bermakna."
            />

            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title="Manajemen Rombongan Belajar"
              description="Kelola kelas dan alokasikan akun siswa secara terisolasi per sekolah dengan kode rombel yang praktis bagi siswa."
            />

            <FeatureCard
              icon={<GraduationCap className="h-5 w-5" />}
              title="Ruang Ujian Bebas Distraksi"
              description="Antarmuka ujian siswa dengan tipografi 16–18px yang nyaman, navigasi soal yang jelas, timer presisi, dan autosave jawaban otomatis."
            />
          </div>
        </Container>
      </section>

      {/* ABOUT POLNES HACKATHON SECTION */}
      <section id="tentang" className="py-16 bg-surface">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Tentang ContextLearning
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Menghubungkan Kurikulum dengan Lingkungan Nyata
            </h2>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              ContextLearning dikembangkan sebagai purwarupa inovatif untuk <strong>IT Competition POLNES 2026</strong>. Platform ini membuktikan bahwa pemahaman siswa terhadap konsep abstrak meningkat signifikan ketika materi pembelajaran merefleksikan kehidupan di sekitar mereka.
            </p>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              Mendukung mata pelajaran Matematika, Bahasa Indonesia, dan IPAS dengan demonstrasi wilayah pesisir perairan Samarinda (Kalimantan Timur) dan agraris lereng Merapi Sleman (DI Yogyakarta).
            </p>

            <div className="pt-4">
              <Link href="/auth/login">
                <Button variant="primary" size="md">
                  Mulai Gunakan Platform <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-surface-subtle py-8">
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

            <p className="text-xs text-secondary">
              Purwarupa IT Competition POLNES • Hak Cipta 2026
            </p>
          </div>
        </Container>
      </footer>
    </main>
  );
}