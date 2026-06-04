import type { ModuleId } from "@afenda/config/module-ids";
import {
  GOVERNED_METADATA_SCHEMA_VERSION,
  type GovernedMultiStepFormConfigurationInput,
} from "./ker-governed-surface-contract";
import { documentWorkflowCopy } from "./ker-route-copy-metadata";

// ─── Document extraction form metadata ───────────────────────────────────────

/**
 * Metadata descriptor for the AI document extraction form.
 *
 * The form captures title, optional document ID, and raw document text for
 * submission to `/api/internal/v1/ai/commands/extract-document`. Wiring the `actionId`
 * to a Server Action requires the caller to register a handler for
 * `document.extraction.submit`.
 */
export function buildDocumentExtractionFormMetadata(input: {
  moduleId: ModuleId;
}): GovernedMultiStepFormConfigurationInput {
  const copy = documentWorkflowCopy.extraction;

  return {
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "wizard",
    formId: `${input.moduleId}.document-extraction`,
    actionId: "document.extraction.submit",
    submitLabel: copy.submitLabel,
    steps: [
      {
        id: "document-details",
        title: "Document details",
        description: copy.idleMessage,
        fields: [
          {
            id: "title",
            label: copy.titleLabel,
            kind: "text",
            required: true,
            placeholder: copy.titlePlaceholder,
          },
          {
            id: "documentId",
            label: copy.documentIdLabel,
            kind: "text",
            placeholder: copy.documentIdPlaceholder,
          },
          {
            id: "documentText",
            label: copy.documentTextLabel,
            kind: "textarea",
            required: true,
            placeholder: copy.documentTextPlaceholder,
          },
        ],
      },
    ],
  };
}
