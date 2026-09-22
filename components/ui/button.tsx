import React, { forwardRef, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none";

    const variantStyles = {
      primary: "bg-primary text-white hover:bg-primary-hover shadow-xs active:translate-y-[0.5px]",
      secondary: "bg-secondary text-white hover:opacity-90 shadow-xs",
      outline:
        "border border-border bg-surface text-foreground hover:bg-[#F7F8FB] hover:border-border-strong hover:text-foreground active:bg-[#ECEFF5]",
      ghost: "text-secondary-text hover:text-foreground hover:bg-[#F2F4F8]",
      destructive: "bg-error text-white hover:opacity-95 shadow-xs active:translate-y-[0.5px]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9.5 px-4 text-sm gap-2",
      lg: "h-11 px-5 text-sm sm:text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
