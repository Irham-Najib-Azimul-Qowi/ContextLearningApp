"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "lg",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#202638]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidthClasses[maxWidth]} rounded-xl border border-border-strong bg-surface shadow-xl transition-all z-10 overflow-hidden`}
      >
        <div className="flex items-start justify-between border-b border-border p-4 sm:p-5">
          <div>
            {title && (
              <h2 className="text-base sm:text-lg font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs sm:text-sm text-secondary-text leading-relaxed">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup dialog"
            className="rounded-lg p-1.5 text-secondary-text hover:bg-[#F2F4F8] hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 sm:p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
