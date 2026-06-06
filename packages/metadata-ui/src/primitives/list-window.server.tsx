import "server-only";

import type { ReactNode } from "react";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

export type MetadataUiPrimitiveListWindowProps = Readonly<{
  title?: ReactNode;
  description?: ReactNode;
  toolbar?: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
  className?: string;
  toolbarClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}>;

export function MetadataUiPrimitiveListWindow({
  title,
  description,
  toolbar,
  content,
  footer,
  className,
  toolbarClassName,
  contentClassName,
  footerClassName,
}: MetadataUiPrimitiveListWindowProps) {
  return (
    <section className={cn("metadata-ui-list-window grid", ui.surfaceGap.sm, className)}>
      {(title || description) ? (
        <div className="grid gap-surface-2xs">
          {title ? <h2 className={cn(ui.typography.sectionTitle, ui.color.ink.foreground)}>{title}</h2> : null}
          {description ? <p className={cn(ui.typography.caption, ui.color.ink.muted)}>{description}</p> : null}
        </div>
      ) : null}
      {toolbar ? <div className={cn("grid gap-surface-sm", toolbarClassName)}>{toolbar}</div> : null}
      <div className={cn("grid gap-surface-sm", contentClassName)}>{content}</div>
      {footer ? <div className={cn("flex flex-wrap items-center gap-surface-xs", footerClassName)}>{footer}</div> : null}
    </section>
  );
}
