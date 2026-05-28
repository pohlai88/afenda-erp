import type { ReactNode } from "react";

import { ModulePageHeader } from "./module-page-header";
import { Card, CardContent } from "@afenda/ui/card";
import { cn } from "@afenda/ui/utils";

import type { ListSurface } from "../schemas/list-surface.schema";

import { GovernedEmpty } from "./governed-empty";

export type GovernedListSurfaceProps = {
  model: ListSurface;
  rowCount: number;
  /** Feature-owned table body (often a client island using TanStack Table). */
  children: ReactNode;
  className?: string;
};

export function GovernedListSurface({
  model,
  rowCount,
  children,
  className,
}: GovernedListSurfaceProps) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-surface-2xl", className)}>
      <ModulePageHeader
        eyebrow={model.header.eyebrow}
        title={model.header.title}
        description={model.header.description}
      />
      <Card size="default">
        <CardContent className="pt-surface-2xl">
          {rowCount === 0 ? <GovernedEmpty model={model.empty} /> : children}
        </CardContent>
      </Card>
    </div>
  );
}
