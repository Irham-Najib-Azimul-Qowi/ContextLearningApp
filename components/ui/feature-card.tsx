import type { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 transition-all hover:border-border-strong hover:shadow-xs">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-base font-semibold text-foreground">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-secondary-text">
        {description}
      </p>
    </div>
  );
}