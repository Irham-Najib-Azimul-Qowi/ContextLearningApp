import type  { Metadata } from "next";
import "./globals.css"

export const metadata: Metadata = {
  title: "Context Learning | Pembelajaran Kontekstual",
  description: 
    "Platform pembelajaran berbasis AI yang membantnu guru membuat soal dan materi sesuai dengan karakteristik lingkungan lokal siswa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
