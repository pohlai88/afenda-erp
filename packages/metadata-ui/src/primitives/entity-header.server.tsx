import "server-only";

import type { ReactNode } from "react";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveDescriptionList } from "./description-list.server";
import { MetadataUiPrimitivePageHeader } from "./page-header.server";
import type { MetadataUiPrimitiveDescriptionListItem } from "./description-list.server";
import type { MetadataUiPageHeaderInput } from "../schemas/page-header.schema";

export type MetadataUiPrimitiveEntityHeaderProps = Readonly<{
  header: MetadataUiPageHeaderInput;
  metaItems?: readonly MetadataUiPrimitiveDescriptionListItem[];
  metaColumns?: 1 | 2 | 3;
  metaTitle?: ReactNode;
  metaDescription?: ReactNode;
  footer?: ReactNode;
  className?: string;
  headerClassName?: string;
  metaClassName?: string;
  footerClassName?: string;
}>;

export function MetadataUiPrimitiveEntityHeader({
  header,
  metaItems,
  metaColumns = 3,
  metaTitle,
  metaDescription,
  footer,
  className,
  headerClassName,
  metaClassName,
  footerClassName,
}: MetadataUiPrimitiveEntityHeaderProps) {
  return (
    <section className={cn("metadata-ui-entity-header grid", ui.surfaceGap.md, className)}>
      <MetadataUiPrimitivePageHeader header={header} className={headerClassName} />
      {metaItems && metaItems.length > 0 ? (
        <MetadataUiPrimitiveDescriptionList
          items={metaItems}
          columns={metaColumns}
          title={metaTitle}
          description={metaDescription}
          className={metaClassName}
        />
      ) : null}
      {footer ? (
        <div className={cn("flex flex-wrap items-center justify-between gap-surface-xs", footerClassName)}>
          {footer}
        </div>
      ) : null}
    </section>
  );
}
