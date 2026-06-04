import "server-only";

import type { ReactNode } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@afenda/ui";
import { type CardSize, ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type {
  MetadataUiPresentationContract,
  MetadataUiPresentationDensity,
  MetadataUiPresentationSurface,
} from "../contracts/presentation.contract";
import { resolveMetadataUiPresentationDensity } from "../presentation/resolve-density.shared";
import { resolveMetadataUiPresentationSurface } from "../presentation/resolve-surface.shared";

export type MetadataUiPrimitiveCardProps = Readonly<{
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  presentation?: MetadataUiPresentationContract;
  className?: string;
  contentClassName?: string;
}>;

const CARD_SIZE_BY_DENSITY = {
  compact: "sm",
  comfortable: "default",
  spacious: "default",
} as const satisfies Record<MetadataUiPresentationDensity, CardSize>;

const CARD_CLASS_BY_SURFACE = {
  plain: ui.surface.inset,
  embedded: ui.surface.inset,
  card: "",
  panel: ui.surface.panel,
  section: ui.surface.section,
} as const satisfies Record<MetadataUiPresentationSurface, string>;

export function resolveMetadataUiPrimitiveCardSize(
  density: MetadataUiPresentationDensity,
): CardSize {
  return CARD_SIZE_BY_DENSITY[density];
}

export function MetadataUiPrimitiveCard({
  children,
  title,
  description,
  actions,
  footer,
  presentation,
  className,
  contentClassName,
}: MetadataUiPrimitiveCardProps) {
  const density = resolveMetadataUiPresentationDensity(presentation);
  const surface = resolveMetadataUiPresentationSurface(presentation);
  const hasHeader = Boolean(title || description || actions);

  return (
    <Card
      size={resolveMetadataUiPrimitiveCardSize(density)}
      className={cn(CARD_CLASS_BY_SURFACE[surface], className)}
    >
      {hasHeader ? (
        <CardHeader>
          {title ? <CardTitle>{title}</CardTitle> : null}
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
          {actions ? <CardAction>{actions}</CardAction> : null}
        </CardHeader>
      ) : null}
      <CardContent className={contentClassName}>{children}</CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  );
}
