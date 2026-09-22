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
    primary: "bg-primary-subtle text-primary border-primary/20",
    secondary: "bg-sky-50 text-[#0369A1] border-sky-200",
    success: "bg-success-subtle text-success border-emerald-200",
    warning: "bg-warning-subtle text-warning border-amber-200",
    error: "bg-error-subtle text-error border-red-200",
    neutral: "bg-[#F2F4F8] text-secondary-text border-border",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold tracking-normal select-none ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
