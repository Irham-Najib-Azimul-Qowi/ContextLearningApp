
import { createClient } from "@/lib/supabase/server";

export default async function TestConnectionPage() {
  const supabase = await createClient();

  const { error } = await supabase
    .from("connection_test")
    .select("id")
    .limit(1);

  const connected =
    error === null ||
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    error.code === "PGRST116";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <h1 className="text-2xl font-bold text-slate-900">
          Supabase Connection Test
        </h1>

        <p className="mt-4 text-slate-600">
          {connected
            ? "Supabase API berhasil diakses."
            : "Koneksi Supabase belum berhasil."}
        </p>

        {error && (
          <p className="mt-3 text-sm text-slate-500">
            {error.message}
          </p>
        )}

      </div>
    </main>
  );
}