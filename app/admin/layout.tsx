import React from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { ShieldCheck } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#EDEFF5] text-[#252B3A]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#F7F8FC]">
        <header className="h-14 border-b border-[#DCE0EA] bg-white px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2 text-xs text-[#697386]">
            <ShieldCheck className="w-4 h-4 text-[#5865D8]" />
            <span className="font-semibold text-[#252B3A]">Konsol Administrator Platform</span>
            <span>•</span>
            <span>Multi-Tenant Global Operations</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
            ADMIN: admin@contextlearning.id
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
