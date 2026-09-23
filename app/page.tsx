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