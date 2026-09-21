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
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-primary">
        {icon}
      </div>
      <h3 className="mb-3 text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="text-sm leading-7 text-muted">
        {description}
      </p>
    </div>
  );
}