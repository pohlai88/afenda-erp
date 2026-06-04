import { z } from "zod";

import { METADATA_UI_ACTION_KEY_SCHEMA } from "../contracts/action.contract";

export const METADATA_UI_ACTION_SUBMISSION_SCHEMA_ID =
  "metadata-ui.action-submission" as const;

export const METADATA_UI_ACTION_SUBMISSION_SCHEMA_VERSION = 1 as const;

export const metadataUiActionSubmissionPayloadSchema = z
  .record(z.string(), z.unknown())
  .default({});

export const metadataUiActionSubmitInputSchema = z
  .object({
    schemaId: z
      .literal(METADATA_UI_ACTION_SUBMISSION_SCHEMA_ID)
      .default(METADATA_UI_ACTION_SUBMISSION_SCHEMA_ID),
    schemaVersion: z
      .literal(METADATA_UI_ACTION_SUBMISSION_SCHEMA_VERSION)
      .default(METADATA_UI_ACTION_SUBMISSION_SCHEMA_VERSION),
    actionKey: METADATA_UI_ACTION_KEY_SCHEMA,
    payload: metadataUiActionSubmissionPayloadSchema,
    confirmationAccepted: z.boolean().default(false),
    auditReason: z.string().trim().min(1).max(500).optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

export const metadataUiActionSubmitFailureCodeSchema = z.enum([
  "invalid-submission",
  "not-server-action",
  "action-hidden",
  "action-disabled",
  "confirmation-required",
  "audit-reason-required",
  "permission-denied",
  "handler-not-registered",
  "handler-failed",
]);

export type MetadataUiActionSubmitFailureCode = z.infer<
  typeof metadataUiActionSubmitFailureCodeSchema
>;

export type MetadataUiActionSubmitInput = z.input<
  typeof metadataUiActionSubmitInputSchema
>;

export type MetadataUiActionSubmission = z.output<
  typeof metadataUiActionSubmitInputSchema
>;

export type MetadataUiActionSubmitSuccessResult<
  Data = unknown,
> = Readonly<{
  success: true;
  actionKey: string;
  data?: Data;
}>;

export type MetadataUiActionSubmitFailureResult = Readonly<{
  success: false;
  actionKey?: string;
  code: MetadataUiActionSubmitFailureCode;
  message: string;
  issues?: readonly string[];
}>;

export type MetadataUiActionSubmitResult<Data = unknown> =
  | MetadataUiActionSubmitSuccessResult<Data>
  | MetadataUiActionSubmitFailureResult;

export function parseMetadataUiActionSubmission(
  input: unknown,
): MetadataUiActionSubmission {
  return metadataUiActionSubmitInputSchema.parse(input);
}

export function createMetadataUiActionSubmitFailure(
  input: Omit<MetadataUiActionSubmitFailureResult, "success">,
): MetadataUiActionSubmitFailureResult {
  return {
    success: false,
    ...input,
  };
}

export function createMetadataUiActionSubmitSuccess<Data = unknown>(
  input: Omit<MetadataUiActionSubmitSuccessResult<Data>, "success">,
): MetadataUiActionSubmitSuccessResult<Data> {
  return {
    success: true,
    ...input,
  };
}
