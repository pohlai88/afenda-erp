import type { MetadataUiRendererContract } from "../contracts/renderer.contract";
import type {
  MetadataUiRenderableState,
  MetadataUiRuntime,
} from "../contracts/runtime.contract";
import type { MetadataUiSectionKind } from "../contracts/section.contract";
import type {
  MetadataUiRuntimeError,
  MetadataUiRuntimeErrorSnapshot,
} from "./runtime-error.shared";
import { isMetadataUiRuntimeError } from "./runtime-error.shared";

export type MetadataUiRuntimeDiagnosticSource =
  | "component-registry"
  | "renderer-registry"
  | "runtime-boundary"
  | "runtime-resolution";

export type MetadataUiRuntimeDiagnostic = Readonly<{
  source: MetadataUiRuntimeDiagnosticSource;
  state: MetadataUiRenderableState;
  runtime: MetadataUiRuntime;
  sectionKind?: MetadataUiSectionKind;
  rendererId?: string;
  componentId?: string;
  message?: string;
  error?: MetadataUiRuntimeErrorSnapshot;
}>;

export type MetadataUiRuntimeResolutionDiagnostics = Readonly<{
  state: MetadataUiRenderableState;
  runtime: MetadataUiRuntime;
  sectionKind: MetadataUiSectionKind;
  renderer?: Pick<
    MetadataUiRendererContract,
    "id" | "lifecycle" | "modulePath" | "schemaId" | "sectionKind"
  >;
  diagnostics: readonly MetadataUiRuntimeDiagnostic[];
}>;

export function createMetadataUiRuntimeDiagnostic(
  diagnostic: MetadataUiRuntimeDiagnostic,
): MetadataUiRuntimeDiagnostic {
  return diagnostic;
}

export function createMetadataUiRuntimeErrorDiagnostic(
  source: MetadataUiRuntimeDiagnosticSource,
  runtime: MetadataUiRuntime,
  error: MetadataUiRuntimeError,
): MetadataUiRuntimeDiagnostic {
  return {
    source,
    runtime,
    state: "error",
    sectionKind: error.context.sectionKind,
    rendererId: error.context.rendererId,
    componentId: error.context.componentId,
    message: error.message,
    error: error.toJSON(),
  };
}

export function normalizeMetadataUiRuntimeErrorDiagnostic(
  source: MetadataUiRuntimeDiagnosticSource,
  runtime: MetadataUiRuntime,
  error: unknown,
): MetadataUiRuntimeDiagnostic {
  if (isMetadataUiRuntimeError(error)) {
    return createMetadataUiRuntimeErrorDiagnostic(source, runtime, error);
  }

  return {
    source,
    runtime,
    state: "error",
    message: error instanceof Error ? error.message : "Unknown runtime error.",
  };
}
