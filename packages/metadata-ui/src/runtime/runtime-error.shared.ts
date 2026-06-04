import type { MetadataUiRuntime } from "../contracts/runtime.contract";
import type { MetadataUiSectionKind } from "../contracts/section.contract";

export type MetadataUiRuntimeErrorCode =
  | "metadata-ui.runtime.boundary"
  | "metadata-ui.runtime.component-not-registered"
  | "metadata-ui.runtime.renderer-not-registered"
  | "metadata-ui.runtime.invalid-section-kind"
  | "metadata-ui.runtime.invalid-renderer"
  | "metadata-ui.runtime.invalid-door";

export type MetadataUiRuntimeErrorSeverity =
  | "warning"
  | "error"
  | "critical";

export type MetadataUiRuntimeErrorContext = Readonly<{
  runtime?: MetadataUiRuntime;
  expectedRuntime?: MetadataUiRuntime;
  door?: string;
  componentId?: string;
  rendererId?: string;
  sectionKind?: MetadataUiSectionKind;
  modulePath?: string;
}>;

export type MetadataUiRuntimeErrorSnapshot = Readonly<{
  code: MetadataUiRuntimeErrorCode;
  message: string;
  severity: MetadataUiRuntimeErrorSeverity;
  context: MetadataUiRuntimeErrorContext;
}>;

export class MetadataUiRuntimeError extends Error {
  readonly code: MetadataUiRuntimeErrorCode;
  readonly severity: MetadataUiRuntimeErrorSeverity;
  readonly context: MetadataUiRuntimeErrorContext;

  constructor(
    code: MetadataUiRuntimeErrorCode,
    message: string,
    context: MetadataUiRuntimeErrorContext = {},
    severity: MetadataUiRuntimeErrorSeverity = "error",
  ) {
    super(message);
    this.name = "MetadataUiRuntimeError";
    this.code = code;
    this.context = context;
    this.severity = severity;
  }

  toJSON(): MetadataUiRuntimeErrorSnapshot {
    return {
      code: this.code,
      message: this.message,
      severity: this.severity,
      context: this.context,
    };
  }
}

export function createMetadataUiRuntimeError(
  code: MetadataUiRuntimeErrorCode,
  message: string,
  context: MetadataUiRuntimeErrorContext = {},
  severity: MetadataUiRuntimeErrorSeverity = "error",
): MetadataUiRuntimeError {
  return new MetadataUiRuntimeError(code, message, context, severity);
}

export function isMetadataUiRuntimeError(
  error: unknown,
): error is MetadataUiRuntimeError {
  return error instanceof MetadataUiRuntimeError;
}
