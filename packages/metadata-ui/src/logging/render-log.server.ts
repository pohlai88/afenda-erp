import "server-only";

import type { MetadataUiRenderableState } from "../contracts/runtime.contract";
import type { MetadataUiSectionKind } from "../contracts/section.contract";
import type { MetadataUiDiagnosticsIdentity } from "../identity/diagnostics.shared";
import type { MetadataUiRuntimeDiagnostic } from "../runtime/runtime-diagnostics.shared";

export type MetadataUiRenderLogLevel = "debug" | "info" | "warn" | "error";

export type MetadataUiRenderLogEventName =
  | "metadata-ui.render.started"
  | "metadata-ui.render.completed"
  | "metadata-ui.render.empty"
  | "metadata-ui.render.forbidden"
  | "metadata-ui.render.invalid"
  | "metadata-ui.render.failed";

export type MetadataUiRenderLogEvent = Readonly<{
  name: MetadataUiRenderLogEventName;
  level: MetadataUiRenderLogLevel;
  state: MetadataUiRenderableState;
  sectionKind?: MetadataUiSectionKind;
  sectionKey?: string;
  rendererKey?: string;
  componentKey?: string;
  testId?: string;
  durationMs?: number;
  diagnostics: readonly MetadataUiRuntimeDiagnostic[];
  metadata: Readonly<Record<string, unknown>>;
  occurredAt: string;
}>;

export type MetadataUiRenderLogSink = (
  event: MetadataUiRenderLogEvent,
) => void | Promise<void>;

export type MetadataUiRenderLogInput = Readonly<{
  name?: MetadataUiRenderLogEventName;
  level?: MetadataUiRenderLogLevel;
  state?: MetadataUiRenderableState;
  sectionKind?: MetadataUiSectionKind;
  identity?: Partial<MetadataUiDiagnosticsIdentity>;
  durationMs?: number;
  diagnostics?: readonly MetadataUiRuntimeDiagnostic[];
  metadata?: Readonly<Record<string, unknown>>;
  occurredAt?: Date;
}>;

export type MetadataUiRenderLogger = Readonly<{
  emit(input: MetadataUiRenderLogInput): Promise<MetadataUiRenderLogEvent>;
  child(metadata: Readonly<Record<string, unknown>>): MetadataUiRenderLogger;
}>;

function inferMetadataUiRenderLogName(
  state: MetadataUiRenderableState,
): MetadataUiRenderLogEventName {
  switch (state) {
    case "ready":
      return "metadata-ui.render.completed";
    case "empty":
      return "metadata-ui.render.empty";
    case "forbidden":
      return "metadata-ui.render.forbidden";
    case "invalid":
      return "metadata-ui.render.invalid";
    case "error":
      return "metadata-ui.render.failed";
    case "loading":
      return "metadata-ui.render.started";
  }
}

function inferMetadataUiRenderLogLevel(
  state: MetadataUiRenderableState,
): MetadataUiRenderLogLevel {
  switch (state) {
    case "error":
      return "error";
    case "forbidden":
    case "invalid":
      return "warn";
    case "loading":
      return "debug";
    case "empty":
    case "ready":
      return "info";
  }
}

export function createMetadataUiRenderLogEvent(
  input: MetadataUiRenderLogInput,
): MetadataUiRenderLogEvent {
  const state = input.state ?? "ready";

  return {
    name: input.name ?? inferMetadataUiRenderLogName(state),
    level: input.level ?? inferMetadataUiRenderLogLevel(state),
    state,
    sectionKind: input.sectionKind,
    sectionKey: input.identity?.sectionKey,
    rendererKey: input.identity?.rendererKey,
    componentKey: input.identity?.componentKey,
    testId: input.identity?.testId,
    durationMs: input.durationMs,
    diagnostics: input.diagnostics ?? [],
    metadata: input.metadata ?? {},
    occurredAt: (input.occurredAt ?? new Date()).toISOString(),
  };
}

export function createMetadataUiRenderLogger(
  sink?: MetadataUiRenderLogSink,
  baseMetadata: Readonly<Record<string, unknown>> = {},
): MetadataUiRenderLogger {
  return {
    async emit(input) {
      const event = createMetadataUiRenderLogEvent({
        ...input,
        metadata: {
          ...baseMetadata,
          ...(input.metadata ?? {}),
        },
      });

      await sink?.(event);

      return event;
    },
    child(metadata) {
      return createMetadataUiRenderLogger(sink, {
        ...baseMetadata,
        ...metadata,
      });
    },
  };
}

export const metadataUiNoopRenderLogger = createMetadataUiRenderLogger();
