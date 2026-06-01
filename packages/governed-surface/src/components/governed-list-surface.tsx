import type { ReactNode } from "react";

import { ModulePageHeader } from "./module-page-header";
import { Card, CardContent } from "@afenda/ui/card";
import { cn } from "@afenda/ui/utils";

import type { ListSurface } from "../schemas/list-surface.schema";
import {
  buildGovernedListSurfaceDataAttributes,
  type GovernedListSurfaceRenderState,
} from "../list-surface-identity.shared";

import { GovernedEmpty } from "./governed-empty";

export type GovernedListSurfaceProps = {
  model: ListSurface;
  rowCount: number;
  /** Feature-owned table body (often a client island using TanStack Table). */
  children: ReactNode;
  className?: string;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
};

export function GovernedListSurface({
  model,
  rowCount,
  children,
  className,
  surfaceKey,
  sectionKey,
  componentKey = surfaceKey ?? model.columnsId,
}: GovernedListSurfaceProps) {
  const listState: GovernedListSurfaceRenderState =
    rowCount === 0 ? "empty" : "ready";
  const contractAttrs = buildGovernedListSurfaceDataAttributes({
    surfaceKey,
    sectionKey,
    columnsId: model.columnsId,
    state: listState,
  });

  return (
    <div
      className={cn("flex w-full min-w-0 flex-col gap-surface-2xl", className)}
      {...contractAttrs}
    >
      <ModulePageHeader
        eyebrow={model.header.eyebrow}
        title={model.header.title}
        description={model.header.description}
        surfaceKey={surfaceKey}
        sectionKey={sectionKey}
        componentKey={`${componentKey}-header`}
      />
      <Card size="default">
        <CardContent className="pt-surface-2xl">
          {rowCount === 0 ? (
            <GovernedEmpty
              model={{
                ...model.empty,
                emptyId: `list-empty-${model.columnsId}`,
              }}
            />
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </div>
  );
}
