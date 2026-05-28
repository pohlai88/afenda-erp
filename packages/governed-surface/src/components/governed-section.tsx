import type { ReactNode } from "react";

import { cn } from "@afenda/ui/utils";

export type GovernedSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function GovernedSection({
  title,
  description,
  children,
  className,
}: GovernedSectionProps) {
  return (
    <section className={cn("flex flex-col gap-surface-md", className)}>
      <div className="flex flex-col gap-1">
        <h3 className="type-subtitle">{title}</h3>
        {description ? (
          <p className="type-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
