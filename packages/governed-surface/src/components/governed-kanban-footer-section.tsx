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
  sectionTestId?: string;
  layout?: GovernedKanbanFooterSectionLayout;
  headerSlot?: ReactNode;
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

  const contractAttrs = buildKanbanSectionDataAttributes({
    surfaceKey,
    state: loadError ? "invalid" : "ready",
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
      aria-describedby={description ? descriptionId : undefined}
      {...contractAttrs}
    >
      {headerSlot}

      <GovernedHeading level={2} variant="section" id={headingId}>
        {title}
      </GovernedHeading>

      {description ? (
        <p className="mb-3 type-muted" id={descriptionId}>
          {description}
        </p>
      ) : null}

      <div className={cn(description ? undefined : "mt-3", contentClassName)}>
        {boardSlot}
      </div>
    </section>
  );
}
