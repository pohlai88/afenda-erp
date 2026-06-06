import "server-only";

import type { ReactNode } from "react";
import { Separator } from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

export type MetadataUiPrimitiveFilterBarProps = Readonly<{
  title?: ReactNode;
  description?: ReactNode;
  summary?: ReactNode;
  search?: ReactNode;
  filters?: ReactNode;
  savedViews?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}>;

export function MetadataUiPrimitiveFilterBar({
  title,
  description,
  summary,
  search,
  filters,
  savedViews,
  actions,
  footer,
  leading,
  trailing,
  className,
}: MetadataUiPrimitiveFilterBarProps) {
  return (
    <section className={cn("metadata-ui-filter-bar grid", ui.surfaceGap.sm, className)}>
      {(title || description || summary || leading || trailing) ? (
        <div className="flex flex-wrap items-start justify-between gap-surface-sm">
          <div className="grid min-w-0 gap-surface-2xs">
            {title ? <h2 className={cn(ui.typography.sectionTitle, ui.color.ink.foreground)}>{title}</h2> : null}
            {description ? <p className={cn(ui.typography.caption, ui.color.ink.muted)}>{description}</p> : null}
            {summary ? <p className={cn(ui.typography.label, ui.color.ink.muted)}>{summary}</p> : null}
          </div>
          {(leading || trailing) ? (
            <div className="flex flex-wrap items-center gap-surface-xs">
              {leading ? <div className="min-w-0">{leading}</div> : null}
              {trailing ? <div className="min-w-0">{trailing}</div> : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {search ? <div className="min-w-0">{search}</div> : null}
      {filters ? (
        <>
          {search ? <Separator /> : null}
          <div className="flex flex-wrap items-center gap-surface-xs">{filters}</div>
        </>
      ) : null}
      {(savedViews || actions) ? (
        <div className="flex flex-wrap items-center justify-between gap-surface-xs">
          {savedViews ? <div className="flex flex-wrap items-center gap-surface-xs">{savedViews}</div> : <span />}
          {actions ? <div className="flex flex-wrap items-center gap-surface-xs">{actions}</div> : null}
        </div>
      ) : null}
      {footer ? <div className="flex flex-wrap items-center gap-surface-xs">{footer}</div> : null}
    </section>
  );
}
