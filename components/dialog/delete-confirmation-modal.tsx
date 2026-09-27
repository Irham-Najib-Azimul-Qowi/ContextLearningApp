"use client";

import React, { useEffect } from "react";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";

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
        return "Room Akses";
      default:
        return "Item";
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#2F273B] to-[#201A29] text-white rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl shadow-black/60 transform transition-all animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          aria-label="Tutup modal konfirmasi"
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition disabled:opacity-40 disabled:pointer-events-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0 shadow-inner">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="pr-6">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 mb-1">
              Konfirmasi Hapus
            </span>
            <h3 id="delete-modal-title" className="text-lg font-bold text-white leading-snug">
              Hapus {getTypeLabel()}?
            </h3>
          </div>
        </div>

        {/* Item Preview Card */}
        <div className="bg-[#1C1624] border border-white/10 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
            <span className="font-medium text-gray-400">Target yang akan dihapus:</span>
            {itemId && (
              <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-[11px] text-amber-300 border border-white/5">
                ID: {itemId}
              </span>
            )}
          </div>
          <p className="font-semibold text-sm text-gray-100 line-clamp-2">
            {itemTitle || `Item ${getTypeLabel()}`}
          </p>
        </div>

        {/* Warning Information */}
        <div className="flex items-start gap-2.5 text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Data ini akan dihapus secara permanen dari perangkat lokal dan tersinkronisasi ke cloud tanpa akan muncul kembali.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition border border-white/5 disabled:opacity-40 disabled:pointer-events-none"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/30 active:scale-95 transition flex items-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
