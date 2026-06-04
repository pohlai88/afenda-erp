import "server-only";

import type { ReactNode } from "react";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

export type MetadataUiPrimitiveListToolbarProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export function MetadataUiPrimitiveListToolbar({
  children,
  className,
}: MetadataUiPrimitiveListToolbarProps) {
  return (
    <div
      className={cn(
        "metadata-ui-list-toolbar flex flex-wrap items-center justify-between",
        ui.surfaceGap.sm,
        className,
      )}
      data-metadata-ui-list-toolbar
    >
      {children}
    </div>
  );
}
