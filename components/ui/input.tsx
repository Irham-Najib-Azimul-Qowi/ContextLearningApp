import React, { forwardRef, InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border px-3.5 py-2 text-sm text-foreground placeholder:text-disabled transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            error
              ? "border-error bg-error-subtle focus:border-error focus:ring-error/20"
              : "border-border bg-surface hover:border-border-strong focus:border-primary"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-error font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-secondary-text">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
