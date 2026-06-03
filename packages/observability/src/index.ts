import type { ModuleId } from "@afenda/config/module-ids";
import {
  getModuleObservabilityIndicators,
  type ModuleObservabilityIndicator,
} from "./module-indicators";

export {
  getModuleObservabilityIndicators,
  type ModuleObservabilityIndicator,
  type ModuleTone,
} from "./module-indicators";
export type {
  ServerLogContext,
  ServerLogEvent,
  ServerLogLevel,
  ServerLogMetadata,
} from "./logger/logger.types";

export const telemetry = {
  serviceName: "afenda-erp",
  analyticsNamespace: "afenda.erp",
};

export type ObservabilityIndicator = ModuleObservabilityIndicator;

export type ProductionHardeningItem = {
  area: string;
  status: "ready" | "configured" | "review";
  detail: string;
};

export const productionHardeningChecklist: readonly ProductionHardeningItem[] =
  [
    {
      area: "Analytics",
      status: "ready",
      detail:
        "Vercel Analytics filters auth screens and records app route traffic.",
    },
    {
      area: "Speed Insights",
      status: "ready",
      detail: "Core Web Vitals are collected from the root app layout.",
    },
    {
      area: "Structured logs",
      status: "configured",
      detail:
        "API routes emit JSON logs with request IDs, duration, status, and module.",
    },
    {
      area: "Log drains",
      status: "configured",
      detail:
        "Signed drain payloads can be accepted at /api/internal/v1/observability/drain.",
    },
    {
      area: "Cron jobs",
      status: "configured",
      detail: "Reminder, sync, and housekeeping routes require CRON_SECRET.",
    },
    {
      area: "RLS",
      status: "configured",
      detail:
        "Tenant tables enforce organization-scoped policies via request-local DB GUC context.",
    },
  ];

export type DrainPayloadSummary = {
  eventCount: number;
  payloadType: "json-array" | "json-object" | "ndjson" | "unknown";
};

export function getObservabilityIndicators(moduleId: ModuleId) {
  return getModuleObservabilityIndicators(moduleId);
}

export function getWorkspaceObservabilitySummary() {
  return {
    serviceName: telemetry.serviceName,
    indicators: [
      {
        label: "Route render budget",
        value: "Sub-250ms",
        detail:
          "Current dynamic routes remain inside the initial server budget.",
        tone: "positive" as const,
      },
      {
        label: "Analytics scope",
        value: "App routes only",
        detail: "Authentication screens remain excluded from page analytics.",
        tone: "neutral" as const,
      },
      {
        label: "Trace backlog",
        value: "02 modules",
        detail: "HR and admin still need richer mutation instrumentation.",
        tone: "warning" as const,
      },
    ],
  };
}

export function getProductionHardeningChecklist() {
  return productionHardeningChecklist;
}

export function formatAnalyticsEventName(moduleId: ModuleId, action: string) {
  return `${telemetry.analyticsNamespace}.${moduleId}.${action}`;
}

export function shouldIgnoreAnalyticsPathname(pathname: string) {
  return pathname.includes("/sign-in") || pathname.includes("/sign-up");
}

export function getRequestId(request: Request) {
  return (
    request.headers.get("x-vercel-id") ??
    request.headers.get("x-request-id") ??
    undefined
  );
}

function timingSafeStringEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyVercelSignature(input: {
  rawBody: string;
  signature: string | null;
  secret: string;
}) {
  if (!input.signature) {
    return false;
  }

  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(input.secret),
    {
      name: "HMAC",
      hash: "SHA-1",
    },
    false,
    ["sign"],
  );
  const digest = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(input.rawBody),
  );
  const expectedSignature = bytesToHex(digest);

  return timingSafeStringEqual(expectedSignature, input.signature);
}

export function summarizeDrainPayload(rawBody: string): DrainPayloadSummary {
  const trimmedBody = rawBody.trim();

  if (!trimmedBody) {
    return {
      eventCount: 0,
      payloadType: "unknown",
    };
  }

  try {
    const parsed = JSON.parse(trimmedBody) as unknown;

    if (Array.isArray(parsed)) {
      return {
        eventCount: parsed.length,
        payloadType: "json-array",
      };
    }

    return {
      eventCount: 1,
      payloadType: "json-object",
    };
  } catch {
    const lineCount = trimmedBody
      .split("\n")
      .filter((line) => line.trim().length > 0).length;

    return {
      eventCount: lineCount,
      payloadType: "ndjson",
    };
  }
}
