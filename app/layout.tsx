import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Depaskan — AI-Powered Contextual Learning",
  description:
    "Depaskan membantu guru membuat dan menyesuaikan materi serta soal pembelajaran dengan konteks lokal wilayah Karesidenan Madiun dan Kota Semarang.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen font-sans antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
