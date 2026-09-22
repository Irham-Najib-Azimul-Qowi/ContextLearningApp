import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ContextLearning | Platform Pembelajaran Kontekstual",
  description:
    "Platform pembelajaran multi-tenant berbasis AI yang membantu guru menciptakan soal dan materi pembelajaran sesuai dengan karakteristik lingkungan lokal siswa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

