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
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
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
  eyebrow,
  description,
  actions,
  meta,
  footer,
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
        data-metadata-ui-empty-kind={kind}
        data-metadata-ui-empty-tone={tone}
        data-metadata-ui-empty-alert="true"
      >
        {icon}
        <div className="grid gap-1">
          {eyebrow ? (
            <p className={cn(ui.typography.label, ui.color.ink.muted)}>
              {eyebrow}
            </p>
          ) : null}
          <AlertTitle>{title}</AlertTitle>
          {meta ? (
            <p className={cn(ui.typography.caption, ui.color.ink.muted)}>
              {meta}
            </p>
          ) : null}
        </div>
        {description ? (
          <AlertDescription>{description}</AlertDescription>
        ) : null}
        {actions ? <div data-slot="metadata-ui-empty-actions">{actions}</div> : null}
        {footer ? <div className="pt-surface-xs">{footer}</div> : null}
      </Alert>
    );
  }

  return (
    <Empty
      className={cn(EMPTY_STATE_CLASS_BY_TONE[tone], className)}
      data-metadata-ui-empty-kind={kind}
      data-metadata-ui-empty-tone={tone}
      data-metadata-ui-empty-alert="false"
    >
      <EmptyHeader>
        {eyebrow ? (
          <p className={cn(ui.typography.label, ui.color.ink.muted)}>
            {eyebrow}
          </p>
        ) : null}
        {icon ? <EmptyMedia variant="icon">{icon}</EmptyMedia> : null}
        <EmptyTitle>{title}</EmptyTitle>
        {meta ? (
          <p className={cn(ui.typography.caption, ui.color.ink.muted)}>
            {meta}
          </p>
        ) : null}
        {description ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {actions ? <EmptyContent>{actions}</EmptyContent> : null}
      {footer ? <div className="pt-surface-xs">{footer}</div> : null}
    </Empty>
  );
}
