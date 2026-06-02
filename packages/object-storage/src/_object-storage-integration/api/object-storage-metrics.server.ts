import "server-only";

import {
  logServerEvent,
  type ServerLogContext,
} from "@afenda/observability";

export const objectStorageMetricNames = [
  "uploads_total",
  "upload_failures",
  "downloads_total",
  "download_failures",
  "permission_denied",
  "malware_detected",
] as const;

export type ObjectStorageMetricName = (typeof objectStorageMetricNames)[number];

type ObjectStorageMetricContext = Partial<
  Pick<ServerLogContext, "organizationId" | "requestId" | "userId">
> & {
  moduleId?: string;
  provider?: string;
};

/** Structured counter via logServerEvent — @afenda/observability has no counter API. */
export function incrementObjectStorageMetric(
  metric: ObjectStorageMetricName,
  context: ObjectStorageMetricContext = {},
  metadata: Record<string, unknown> = {},
) {
  logServerEvent(
    "info",
    `Object storage metric: ${metric}`,
    {
      module: "object-storage",
      operation: `metric.${metric}`,
      organizationId: context.organizationId,
      requestId: context.requestId,
      userId: context.userId,
    },
    {
      metric,
      metricValue: 1,
      metricType: "counter",
      moduleId: context.moduleId,
      provider: context.provider,
      ...metadata,
    },
  );
}
