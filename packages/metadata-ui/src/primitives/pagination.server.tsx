import "server-only";

import type { ReactNode } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

export type MetadataUiPrimitivePaginationPageItem = Readonly<
  | {
      key: string;
      kind?: "page";
      page: number;
      href: string;
      current?: boolean;
      label?: ReactNode;
    }
  | {
      key: string;
      kind: "ellipsis";
    }
>;

export type MetadataUiPrimitivePaginationProps = Readonly<{
  items: readonly MetadataUiPrimitivePaginationPageItem[];
  summary?: ReactNode;
  previousHref?: string;
  nextHref?: string;
  className?: string;
  contentClassName?: string;
  summaryClassName?: string;
}>;

export function MetadataUiPrimitivePagination({
  items,
  summary,
  previousHref,
  nextHref,
  className,
  contentClassName,
  summaryClassName,
}: MetadataUiPrimitivePaginationProps) {
  return (
    <nav className={cn("metadata-ui-pagination grid gap-surface-sm", className)} aria-label="Pagination">
      {summary ? <p className={cn(ui.typography.caption, ui.color.ink.muted, summaryClassName)}>{summary}</p> : null}
      <Pagination className="justify-start">
        <PaginationContent className={cn("flex flex-wrap items-center gap-1", contentClassName)}>
          {previousHref ? (
            <PaginationItem>
              <PaginationPrevious href={previousHref} />
            </PaginationItem>
          ) : null}
          {items.map((item) =>
            item.kind === "ellipsis" ? (
              <PaginationItem key={item.key}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item.key}>
                <PaginationLink href={item.href} isActive={item.current}>
                  {item.label ?? item.page}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          {nextHref ? (
            <PaginationItem>
              <PaginationNext href={nextHref} />
            </PaginationItem>
          ) : null}
        </PaginationContent>
      </Pagination>
    </nav>
  );
}

