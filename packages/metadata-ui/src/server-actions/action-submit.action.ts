"use server";

import {
  createMetadataUiActionSubmitFailure,
  parseMetadataUiActionSubmission,
  type MetadataUiActionSubmitInput,
  type MetadataUiActionSubmitResult,
} from "./action-fields.shared";

export async function submitMetadataUiAction(
  input: MetadataUiActionSubmitInput,
): Promise<MetadataUiActionSubmitResult> {
  const parsed = parseMetadataUiActionSubmission(input);

  return createMetadataUiActionSubmitFailure({
    actionKey: parsed.actionKey,
    code: "handler-not-registered",
    message:
      "Metadata UI server action submission is not wired to an application registry.",
  });
}
