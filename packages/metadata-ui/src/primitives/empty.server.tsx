import "server-only";

import type { ReactNode } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type {
  MetadataUiEmptyStateKind,
  MetadataUiEmptyStateTone,
} from "../schemas/empty-state.schema";

export type MetadataUiPrimitiveEmptyStateProps = Readonly<{
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  kind?: MetadataUiEmptyStateKind;
  tone?: MetadataUiEmptyStateTone;
  className?: string;
}>;

const EMPTY_STATE_CLASS_BY_TONE = {
  neutral: "",
  info: ui.tone.info,
  positive: ui.tone.success,
  warning: ui.tone.warning,
  critical: ui.tone.critical,
} as const satisfies Record<MetadataUiEmptyStateTone, string>;

const ALERT_KIND = new Set<MetadataUiEmptyStateKind>([
  "error",
  "forbidden",
  "not-available",
]);

export function shouldRenderMetadataUiPrimitiveEmptyAsAlert(
  kind: MetadataUiEmptyStateKind,
): boolean {
  return ALERT_KIND.has(kind);
}

export function MetadataUiPrimitiveEmptyState({
  title,
  description,
  actions,
  icon,
  kind = "empty",
  tone = "neutral",
  className,
}: MetadataUiPrimitiveEmptyStateProps) {
  if (shouldRenderMetadataUiPrimitiveEmptyAsAlert(kind)) {
    return (
      <Alert
        variant={tone === "critical" ? "destructive" : "default"}
        className={cn(EMPTY_STATE_CLASS_BY_TONE[tone], className)}
      >
        {icon}
        <AlertTitle>{title}</AlertTitle>
        {description ? (
          <AlertDescription>{description}</AlertDescription>
        ) : null}
        {actions ? <div data-slot="metadata-ui-empty-actions">{actions}</div> : null}
      </Alert>
    );
  }

  return (
    <Empty className={cn(EMPTY_STATE_CLASS_BY_TONE[tone], className)}>
      <EmptyHeader>
        {icon ? <EmptyMedia variant="icon">{icon}</EmptyMedia> : null}
        <EmptyTitle>{title}</EmptyTitle>
        {description ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {actions ? <EmptyContent>{actions}</EmptyContent> : null}
    </Empty>
  );
}
