"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, School } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolName, setSchoolName] = useState("SD Negeri 001 Samarinda Kota");
  const [province, setProvince] = useState("Kalimantan Timur");
  const [regency, setRegency] = useState("Kota Samarinda");
  const [district, setDistrict] = useState("Samarinda Kota");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      try {
        localStorage.setItem("contextlearning_role", "teacher");
        localStorage.setItem("contextlearning_name", fullName || "Ibu Guru");
        localStorage.setItem(
          "contextlearning_user",
          JSON.stringify({
            id: `teacher-${Date.now()}`,
            role: "teacher",
            name: fullName || "Ibu Guru",
            school: schoolName,
            province,
            regency,
            district,
          })
        );
      } catch {
        // ignore
      }

      setIsLoading(false);
      router.push("/teacher/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-primary mb-4 shadow-xs">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Pendaftaran Akun Guru
            </h1>
            <p className="text-sm text-muted mt-2">
              Mulai buat soal dan materi kontekstual yang relevan dengan lingkungan sekolah Anda.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Nama Lengkap Beserta Gelar"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Ibu Nurhaliza, S.Pd."
              />

              <Input
                label="Alamat Email Sekolah / Dinas"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guru@sd001samarinda.sch.id"
              />

              <Input
                label="Kata Sandi"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
              />

              <div className="pt-2 border-t border-border/60">
                <div className="flex items-center gap-2 mb-3">
                  <School className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Profil Sekolah & Wilayah
                  </span>
                </div>

                <div className="space-y-3">
                  <Input
                    label="Nama Sekolah Dasar"
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="SD Negeri 001 Samarinda Kota"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Provinsi"
                      type="text"
                      required
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                    />
                    <Input
                      label="Kabupaten / Kota"
                      type="text"
                      required
                      value={regency}
                      onChange={(e) => setRegency(e.target.value)}
                    />
                  </div>

                  <Input
                    label="Kecamatan"
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-4"
                isLoading={isLoading}
              >
                Daftar & Masuk ke Dashboard <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted border-t border-border/60 pt-4">
              Sudah memiliki akun?{" "}
              <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                Masuk di sini
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
