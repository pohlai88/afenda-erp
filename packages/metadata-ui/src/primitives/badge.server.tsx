import "server-only";

import type { ReactNode } from "react";
import { Badge } from "@afenda/ui";
import { type BadgeVariant, ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type { MetadataUiActionTone } from "../contracts/action.contract";
import type { MetadataUiPresentationTone } from "../contracts/presentation.contract";

export type MetadataUiPrimitiveBadgeTone =
  | MetadataUiPresentationTone
  | MetadataUiActionTone
  | "info";

export type MetadataUiPrimitiveBadgeProps = Readonly<{
  children: ReactNode;
  tone?: MetadataUiPrimitiveBadgeTone;
  title?: string;
  className?: string;
}>;

const BADGE_VARIANT_BY_TONE = {
  neutral: "secondary",
  primary: "default",
  positive: "success",
  warning: "warning",
  critical: "critical",
  muted: "outline",
  info: "info",
} as const satisfies Record<MetadataUiPrimitiveBadgeTone, BadgeVariant>;

export function resolveMetadataUiPrimitiveBadgeVariant(
  tone: MetadataUiPrimitiveBadgeTone = "neutral",
): BadgeVariant {
  return BADGE_VARIANT_BY_TONE[tone];
}

export function MetadataUiPrimitiveBadge({
  children,
  tone = "neutral",
  title,
  className,
}: MetadataUiPrimitiveBadgeProps) {
  return (
    <Badge
      title={title}
      variant={resolveMetadataUiPrimitiveBadgeVariant(tone)}
      className={cn(ui.text.label, className)}
    >
      {children}
    </Badge>
  );
}
