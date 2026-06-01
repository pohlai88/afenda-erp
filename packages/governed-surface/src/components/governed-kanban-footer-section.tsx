import "server-only";

import type { ReactNode } from "react";

import { cn } from "@afenda/ui/utils";

import type { EmptyState } from "../schemas/list-surface.schema";
import {
  buildKanbanSectionDataAttributes,
  governedKanbanSectionTestId,
} from "../kanban-surface-identity.shared";
import { GovernedHeading } from "../utils/governed-heading.shared";
import {
  governedDescriptionId,
  governedHeadingId,
} from "../utils/governed-identity.shared";

import { GovernedEmpty } from "./governed-empty";

export type GovernedKanbanFooterSectionLayout = "embedded" | "titled";

export type GovernedKanbanFooterSectionProps = {
  surfaceKey: string;
  title: string;
  description?: string;
  /** Defaults to `governedKanbanSectionTestId(surfaceKey)`. */
  sectionTestId?: string;
  layout?: GovernedKanbanFooterSectionLayout;
  headerSlot?: ReactNode;
  /** Query failure — renders error empty state instead of the board bridge. */
  loadError?: EmptyState;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

/**
 * RSC section shell for Pattern K kanban boards (`footer-actions` or `drag-reorder`).
 * Domain modules pass `GovernedKanbanFooterBoard`, `GovernedKanbanDragBoard`, or
 * `KanbanBoardView` (read-only) as children.
 */
export function GovernedKanbanFooterSection({
  surfaceKey,
  title,
  description,
  sectionTestId,
  layout = "titled",
  headerSlot,
  loadError,
  children,
  className,
  contentClassName,
}: GovernedKanbanFooterSectionProps) {
  const testId = sectionTestId ?? governedKanbanSectionTestId(surfaceKey);
  const headingId = governedHeadingId("kanban-section", surfaceKey);
  const descriptionId = governedDescriptionId("kanban-section", surfaceKey);
  const renderState = loadError ? "invalid" : "ready";
  const contractAttrs = buildKanbanSectionDataAttributes({
    surfaceKey,
    state: renderState,
    testId,
  });
  const boardSlot = loadError ? (
    <GovernedEmpty
      model={{
        ...loadError,
        emptyId: "kanban-section-load-error",
      }}
    />
  ) : (
    children
  );

  if (layout === "embedded") {
    return (
      <div className={className} {...contractAttrs}>
        {headerSlot}
        <div className={contentClassName}>{boardSlot}</div>
      </div>
    );
  }

  return (
    <section
      className={className}
      aria-labelledby={headingId}
      {...(description ? { "aria-describedby": descriptionId } : {})}
      {...contractAttrs}
    >
      {headerSlot}
      <GovernedHeading level={2} variant="section" id={headingId}>
        {title}
      </GovernedHeading>
      {description ? (
        <p className={cn("mb-3 type-muted", contentClassName)} id={descriptionId}>
          {description}
        </p>
      ) : null}
      <div className={description ? undefined : contentClassName}>
        {boardSlot}
      </div>
    </section>
  );
}
