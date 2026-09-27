"use client";

import React, { useEffect } from "react";
import { Trash2, Loader2, X } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  itemType: "materi" | "soal" | "room" | string;
  itemId?: string;
  itemTitle?: string;
  isDeleting?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  itemType,
  itemId,
  itemTitle,
  isDeleting = false,
  onConfirm,
  onClose,
}: DeleteConfirmationModalProps) {
  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  const getTypeLabel = () => {
    switch (itemType.toLowerCase()) {
      case "materi":
        return "Modul Materi";
      case "soal":
        return "Butir Soal";
      case "room":
        return "Ruang Akses";
      default:
        return "Item";
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#3E3547] to-[#251E2B] text-white rounded-[28px] p-6 sm:p-7 border border-[#5A4F65] shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Tombol Tutup X di pojok kanan atas */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          aria-label="Tutup dialog"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Bersih: Ikon + Judul */}
        <div className="flex items-center gap-3 mb-3 pr-8">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Trash2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h3 id="delete-modal-title" className="text-base sm:text-lg font-black text-white tracking-tight">
            Hapus {getTypeLabel()}?
          </h3>
        </div>

        {/* Deskripsi Bersih & Terarah (tanpa kotak-kotak bertumpuk) */}
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
          Apakah Anda yakin ingin menghapus{" "}
          <span className="font-bold text-white">
            &ldquo;{itemTitle || getTypeLabel()}&rdquo;
          </span>
          ? Tindakan ini tidak dapat dibatalkan.
        </p>

        {/* Tombol Aksi Simpel & Minimalis */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-rose-600 hover:bg-rose-500 text-white shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <span>Hapus</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
