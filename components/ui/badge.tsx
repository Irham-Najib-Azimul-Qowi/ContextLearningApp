import React, { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "neutral";
}

export function Badge({
  className = "",
  variant = "neutral",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    primary: "bg-indigo-50 text-primary border-indigo-200/60",
    secondary: "bg-sky-50 text-secondary border-sky-200/60",
    success: "bg-emerald-50 text-success border-emerald-200/60",
    warning: "bg-amber-50 text-warning border-amber-200/60",
    error: "bg-red-50 text-error border-red-200/60",
    neutral: "bg-slate-100 text-muted border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
