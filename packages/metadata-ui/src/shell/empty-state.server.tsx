import "server-only";

import type { ReactNode } from "react";

import { MetadataUiPrimitiveEmptyState } from "../primitives/empty.server";

export type MetadataUiEmptyStateTone =
  | "neutral"
  | "info"
  | "warning"
  | "critical";

export type MetadataUiEmptyStateProps = Readonly<{
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  tone?: MetadataUiEmptyStateTone;
}>;

export function MetadataUiEmptyState({
  title,
  description,
  actions,
  icon,
  tone = "neutral",
}: MetadataUiEmptyStateProps) {
  return (
    <MetadataUiPrimitiveEmptyState
      title={title}
      description={description}
      actions={actions}
      icon={icon}
      tone={tone}
    />
  );
}
