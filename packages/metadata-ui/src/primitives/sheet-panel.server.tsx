import "server-only";

import type { ReactNode } from "react";
import {
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetDescription,
  SheetTitle,
} from "@afenda/ui";
import { cn } from "@afenda/ui/utils";

export type MetadataUiPrimitiveSheetPanelProps = Readonly<{
  title: ReactNode;
  description?: ReactNode;
  status?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}>;

export function MetadataUiPrimitiveSheetPanel({
  title,
  description,
  status,
  children,
  footer,
  side = "right",
  showCloseButton = true,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  titleClassName,
  descriptionClassName,
}: MetadataUiPrimitiveSheetPanelProps) {
  return (
    <SheetContent
      side={side}
      showCloseButton={showCloseButton}
      className={cn("flex flex-col gap-0 p-0", className)}
    >
      <div className={cn("grid flex-1 min-h-0 gap-surface-md", bodyClassName)}>
        <SheetHeader className={cn("sticky top-0 z-10 bg-popover/95 backdrop-blur", headerClassName)}>
          {status ? <div className="flex flex-wrap items-center gap-surface-xs">{status}</div> : null}
          <SheetTitle className={titleClassName}>{title}</SheetTitle>
          {description ? (
            <SheetDescription className={descriptionClassName}>{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="min-h-0 overflow-y-auto px-surface-lg">{children}</div>
        {footer ? (
          <SheetFooter className={cn("border-t border-border/60 bg-popover/95 backdrop-blur", footerClassName)}>
            {footer}
          </SheetFooter>
        ) : null}
      </div>
    </SheetContent>
  );
}
