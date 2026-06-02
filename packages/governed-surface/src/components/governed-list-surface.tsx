import type { ReactNode } from "react";

import { Card, CardContent } from "@afenda/ui/card";
import { cn } from "@afenda/ui/utils";

import type { EmptyState, ListSurface } from "../schemas/list-surface.schema";
import {
  buildGovernedListSurfaceDataAttributes,
  type GovernedListSurfaceRenderState,
} from "../list-surface-identity.shared";

import { GovernedEmpty } from "./governed-empty";
import { ModulePageHeader } from "./module-page-header";

export type GovernedListSurfaceProps = {
  model: ListSurface;
  rowCount: number;
  /** Feature-owned table body (often a client island using TanStack Table). */
  children: ReactNode;
  className?: string;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
  contentClassName?: string;
};

export function GovernedListSurface({
  model,
  rowCount,
  children,
  className,
  surfaceKey,
  sectionKey,
  componentKey = surfaceKey ?? model.columnsId,
  contentClassName,
}: GovernedListSurfaceProps) {
  const listState: GovernedListSurfaceRenderState =
    rowCount === 0 ? "empty" : "ready";

  const contractAttrs = buildGovernedListSurfaceDataAttributes({
    surfaceKey,
    sectionKey,
    componentKey,
    columnsId: model.columnsId,
    state: listState,
  });

  const emptyModel = model.empty as EmptyState & { emptyId?: string };

  return (
    <div
      className={cn("flex w-full min-w-0 flex-col gap-surface-2xl", className)}
      {...contractAttrs}
    >
      <ModulePageHeader
        eyebrow={model.header.eyebrow}
        title={model.header.title}
        description={model.header.description}
        surfaceKey={surfaceKey ?? model.columnsId}
        sectionKey={sectionKey}
        componentKey={`${componentKey}-header`}
      />

      <Card size="default">
        <CardContent className={cn("pt-surface-2xl", contentClassName)}>
          {listState === "empty" ? (
            <GovernedEmpty
              model={{
                ...model.empty,
                emptyId: emptyModel.emptyId ?? `list-empty-${model.columnsId}`,
              }}
              testId={`governed-list-empty-${model.columnsId}`}
            />
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </div>
  );
}
