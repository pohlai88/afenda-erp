import type { MetadataUiDiagnosticsIdentity } from "../identity/diagnostics.shared";
import {
  createMetadataUiRenderLogEvent,
  type MetadataUiRenderLogEvent,
  type MetadataUiRenderLogInput,
  type MetadataUiRenderLogger,
} from "./render-log.server";

export type MetadataUiListRenderWindow = Readonly<{
  rowCount: number;
  visibleRowCount?: number;
  pageSize?: number;
  pageIndex?: number;
  totalRowCount?: number;
}>;

export type MetadataUiListRenderLogInput = Omit<
  MetadataUiRenderLogInput,
  "metadata" | "name" | "state"
> &
  Readonly<{
    identity?: Partial<MetadataUiDiagnosticsIdentity>;
    window: MetadataUiListRenderWindow;
    metadata?: Readonly<Record<string, unknown>>;
  }>;

function createMetadataUiListRenderLogMetadata(
  input: MetadataUiListRenderLogInput,
): Readonly<Record<string, unknown>> {
  return {
    ...(input.metadata ?? {}),
    list: {
      rowCount: input.window.rowCount,
      visibleRowCount: input.window.visibleRowCount,
      pageSize: input.window.pageSize,
      pageIndex: input.window.pageIndex,
      totalRowCount: input.window.totalRowCount,
    },
  };
}

function createMetadataUiListRenderLogState(
  input: MetadataUiListRenderLogInput,
) {
  return input.window.rowCount === 0 ? "empty" : "ready";
}

function createMetadataUiListRenderLogName(
  input: MetadataUiListRenderLogInput,
) {
  return input.window.rowCount === 0
    ? "metadata-ui.render.empty"
    : "metadata-ui.render.completed";
}

export function createMetadataUiListRenderLogEvent(
  input: MetadataUiListRenderLogInput,
): MetadataUiRenderLogEvent {
  return createMetadataUiRenderLogEvent({
    ...input,
    name: createMetadataUiListRenderLogName(input),
    state: createMetadataUiListRenderLogState(input),
    metadata: createMetadataUiListRenderLogMetadata(input),
  });
}

export async function emitMetadataUiListRenderLog(
  logger: MetadataUiRenderLogger,
  input: MetadataUiListRenderLogInput,
): Promise<MetadataUiRenderLogEvent> {
  return logger.emit({
    ...input,
    name: createMetadataUiListRenderLogName(input),
    state: createMetadataUiListRenderLogState(input),
    metadata: createMetadataUiListRenderLogMetadata(input),
  });
}
