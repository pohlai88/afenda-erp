import "server-only";

import type { ReactNode } from "react";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

export type MetadataUiPrimitiveListToolbarProps = Readonly<{
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  footer?: ReactNode;
  className?: string;
}>;

export function MetadataUiPrimitiveListToolbar({
  children,
  title,
  description,
  leading,
  trailing,
  footer,
  className,
}: MetadataUiPrimitiveListToolbarProps) {
  return (
    <section
      className={cn("metadata-ui-list-toolbar grid", ui.surfaceGap.sm, className)}
      data-metadata-ui-list-toolbar
    >
      {(title || description || leading || trailing) ? (
        <div className="flex flex-wrap items-start justify-between gap-surface-sm">
          <div className="grid min-w-0 gap-surface-2xs">
            {title ? (
              <h2 className={cn(ui.typography.sectionTitle, ui.color.ink.foreground)}>
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className={cn(ui.typography.caption, ui.color.ink.muted)}>
                {description}
              </p>
            ) : null}
          </div>
          {(leading || trailing) ? (
            <div className="flex flex-wrap items-center gap-surface-xs">
              {leading ? <div className="min-w-0">{leading}</div> : null}
              {trailing ? <div className="min-w-0">{trailing}</div> : null}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-surface-sm">
        {children}
      </div>
      {footer ? <div className="flex flex-wrap items-center gap-surface-xs">{footer}</div> : null}
    </section>
  );
}
