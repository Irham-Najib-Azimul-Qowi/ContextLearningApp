"use client";

import React from "react";
import Link from "next/link";

interface PahamiPuzzleLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  theme?: "light" | "dark";
}

/**
 * DepaskanLogo / PahamiPuzzleLogo
 * Brand identity logo: Capital letter 'D' constructed as a rounded puzzle piece,
 * followed directly by lowercase text "epaskan" in exact vertical center alignment so it reads "Depaskan".
 */
export function PahamiPuzzleLogo({
  size = "md",
  showText = true,
  className = "",
  theme = "light",
}: PahamiPuzzleLogoProps) {
  // Dimensions scale: tuned so the 'D' puzzle glyph and 'epaskan' text align in the exact vertical center
  const sizeMap = {
    sm: { icon: 34, text: "text-2xl" },
    md: { icon: 44, text: "text-3xl" },
    lg: { icon: 56, text: "text-4xl" },
  };

  const currentSize = sizeMap[size];

  // Path data for Capital Letter 'D' with interlocking puzzle knob on curved right side
  // Uses evenodd fill rule with outer puzzle contour and inner letter D counter
  const puzzleDPath = `
    M 22 16
    H 48
    C 62 16, 73 24, 76 34
    C 77 37, 76 40, 79 42
    C 83 42, 86 38, 91 42
    C 96 46, 96 54, 91 58
    C 86 62, 83 58, 79 58
    C 76 60, 77 63, 76 66
    C 73 76, 62 84, 48 84
    H 22
    C 18.7 84, 16 81.3, 16 78
    V 22
    C 16 18.7, 18.7 16, 22 16
    Z
    M 34 32
    V 68
    H 46
    C 56 68, 62 61, 62 50
    C 62 39, 56 32, 46 32
    H 34
    Z
  `.replace(/\s+/g, " ").trim();

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#51465B] rounded-2xl p-1 transition-transform active:scale-95 ${className}`}
      aria-label="Beranda Depaskan"
    >
      {/* Puzzle D SVG Icon (Acts as the capital letter 'D') */}
      <div
        className="relative shrink-0 select-none group-hover:-translate-y-0.5 transition-transform duration-200 flex items-center justify-center"
        style={{ width: currentSize.icon, height: currentSize.icon }}
      >
        <svg
          viewBox="0 0 108 108"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* 1. Exact Puzzle Silhouette Hard Offset Shadow (Bottom-Right translation) */}
          <path
            d={puzzleDPath}
            fill="#23212A"
            fillRule="evenodd"
            transform="translate(5, 6)"
            className="opacity-95"
          />

          {/* 2. Main Puzzle Letter D Body in Warm Yellow (#FFD36D) */}
          <path
            d={puzzleDPath}
            fill="#FFD36D"
            fillRule="evenodd"
            stroke="#51465B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* 3. Subtle claymorphism soft highlight curve on top arch */}
          <path
            d="M 24 20 H 48 C 58 20, 68 26, 71 34"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            className="opacity-70 pointer-events-none"
          />

          {/* 4. Small decorative center notch accent */}
          <circle cx="87" cy="50" r="2.5" fill="#51465B" />
        </svg>
      </div>

      {/* Brand Typography: Lowercase "epaskan" perfectly centered vertically with the 'D' puzzle glyph */}
      {showText && (
        <span
          className={`font-black tracking-tight leading-none lowercase select-none ${currentSize.text} ${
            theme === "dark" ? "text-white" : "text-[#51465B]"
          }`}
          style={{ transform: "translateY(-1px)" }}
        >
          epaskan
        </span>
      )}
    </Link>
  );
}

export const DepaskanLogo = PahamiPuzzleLogo;
