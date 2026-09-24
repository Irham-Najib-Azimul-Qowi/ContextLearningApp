export default function HomePage() {
  const madiunRegions = [
    { code: "35.77", name: "Kota Madiun", highlight: "Pusat industri & kearifan lokal" },
    { code: "35.19", name: "Kabupaten Madiun", highlight: "Pertanian, komoditas & sejarah" },
    { code: "35.21", name: "Kabupaten Ngawi", highlight: "Bentang alam & situs purbakala" },
    { code: "35.20", name: "Kabupaten Magetan", highlight: "Kaki Gunung Lawu & kerajinan" },
    { code: "35.02", name: "Kabupaten Ponorogo", highlight: "Seni budaya & tradisi Reog" },
    { code: "35.01", name: "Kabupaten Pacitan", highlight: "Pesisir selatan & bentang karst" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-6 sm:p-12 md:p-16">
      <div className="max-w-4xl mx-auto w-full">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold tracking-wide mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          Prototipe Tahap Pengembangan — Karesidenan Madiun
        </div>

        {/* Hero Section */}
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 mb-3">
            Pahami
          </h1>
          <p className="text-xl sm:text-2xl font-medium text-indigo-600 mb-6">
            AI-Powered Contextual Learning
          </p>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
            Pahami membantu guru membuat dan menyesuaikan materi serta soal pembelajaran dengan konteks lokal wilayah Keresidenan Madiun.
          </p>

          {/* Primary Authentication Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 font-bold shadow-md hover:shadow-lg transition-all group"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Masuk dengan Google (Akun Guru & Siswa)</span>
              <span className="p-1 rounded-lg bg-slate-100 group-hover:translate-x-1 transition-transform text-slate-500">
                &rarr;
              </span>
            </a>
          </div>

          {/* Quick Entry Portals (Mode Evaluasi Cepat) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
            <a
              href="/teacher/dashboard"
              className="inline-flex items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs hover:shadow transition-all group flex-1"
            >
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-indigo-200 font-bold">
                  Akses Demo Cepat
                </div>
                <div className="text-sm font-extrabold">Workspace Guru SD</div>
              </div>
              <span className="p-1.5 rounded-lg bg-white/20 group-hover:translate-x-1 transition-transform text-xs">
                &rarr;
              </span>
            </a>

            <a
              href="/student/dashboard"
              className="inline-flex items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-white hover:bg-sky-50 border-2 border-sky-400 text-sky-950 font-semibold shadow-xs hover:shadow transition-all group flex-1"
            >
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-sky-600 font-bold">
                  Siswa SD
                </div>
                <div className="text-sm font-extrabold text-slate-900">Portal Belajar Murid</div>
              </div>
              <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700 group-hover:translate-x-1 transition-transform text-xs">
                &rarr;
              </span>
            </a>
          </div>
        </header>

        {/* Regional Focus Grid */}
        <section className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Cakupan Wilayah Prototipe Awal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {madiunRegions.map((region) => (
              <div
                key={region.code}
                className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-medium text-slate-500">
                    ID: {region.code}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Terdaftar
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{region.name}</h3>
                <p className="text-xs text-slate-600 mt-1">{region.highlight}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Prototype Scope & Collaboration Notice */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-3">
            Informasi Status Prototipe
          </h2>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>
              Aplikasi ini berada dalam fase persiapan fondasi teknis Pahami V2. Implementasi modul LMS lawas telah dibersihkan agar fokus sepenuhnya pada rekayasa pembelajaran kontekstual lokal.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-900 text-sm mb-1">
                  Modul 1: Data & RAG Engine
                </h4>
                <p className="text-xs text-slate-600">
                  Pengumpulan dataset lokal, ekstraksi entitas Karesidenan Madiun, pembuatan embedding, dan pencarian hybrid via PostgreSQL + pgvector.
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-900 text-sm mb-1">
                  Modul 2: Web & Context Engine
                </h4>
                <p className="text-xs text-slate-600">
                  Studio materi & soal guru, ekstraksi variabel kontekstual, integrasi model Google Gemini, dan distribusi naskah pembelajaran.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-12 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-slate-200 mt-12">
        <span>&copy; {new Date().getFullYear()} Pahami — AI-Powered Contextual Learning</span>
        <span className="font-mono text-slate-400">Fondasi V2 Bersih &bull; Karesidenan Madiun</span>
      </footer>
    </main>
  );
}