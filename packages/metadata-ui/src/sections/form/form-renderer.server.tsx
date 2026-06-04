import "server-only";

import { MetadataUiPrimitiveActionButton } from "../../primitives/action-button.server";
import {
  MetadataUiPrimitiveField,
  MetadataUiPrimitiveFieldGroup,
} from "../../primitives/field.server";
import {
  type MetadataUiForm,
  type MetadataUiFormInput,
  parseMetadataUiForm,
} from "../../schemas/form.schema";
import { MetadataUiClientForm } from "./form.client";

export type MetadataUiFormRendererProps = Readonly<{
  metadata: MetadataUiFormInput;
}>;

type MetadataUiFormRendererAction = Readonly<{
  action: MetadataUiForm["actions"][number]["action"];
}>;

type MetadataUiGroupedFormActions = Readonly<{
  primary: MetadataUiFormRendererAction[];
  secondary: MetadataUiFormRendererAction[];
}>;

function groupMetadataUiFormActions(
  form: MetadataUiForm,
): MetadataUiGroupedFormActions {
  const groups: MetadataUiGroupedFormActions = {
    primary: form.submitAction ? [{ action: form.submitAction }] : [],
    secondary: [],
  };

  for (const formAction of form.actions) {
    if (formAction.placement === "primary") {
      groups.primary.push(formAction);
    } else {
      groups.secondary.push(formAction);
    }
  }

  return groups;
}

export function MetadataUiFormRenderer({ metadata }: MetadataUiFormRendererProps) {
  const form = parseMetadataUiForm(metadata);
  const actions = groupMetadataUiFormActions(form);

  return (
    <MetadataUiClientForm
      className="metadata-ui-form"
      aria-label={form.title}
      metadataState={form.state}
      noValidate
    >
      {form.errorSummary.errors.length > 0 ? (
        <section
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900"
          aria-live="polite"
          data-metadata-ui-form-error-summary="true"
        >
          <h3 className="font-medium">{form.errorSummary.title}</h3>
          <ul className="mt-2 list-disc pl-5">
            {form.errorSummary.errors.map((error) => (
              <li key={`${error.fieldKey}-${error.message}`}>
                {error.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {form.sections.map((section) => (
        <MetadataUiPrimitiveFieldGroup key={section.key} section={section}>
          {section.fields.map((field) => (
            <MetadataUiPrimitiveField
              key={field.key}
              field={field}
              mode={form.mode}
            />
          ))}
        </MetadataUiPrimitiveFieldGroup>
      ))}
      {actions.primary.length > 0 || actions.secondary.length > 0 ? (
        <div className="flex flex-wrap items-center justify-end gap-surface-xs">
          {actions.secondary.map((action) => (
            <MetadataUiPrimitiveActionButton
              key={action.action.id}
              action={action.action}
              priority="secondary"
            />
          ))}
          {actions.primary.map((action) => (
            <MetadataUiPrimitiveActionButton
              key={action.action.id}
              action={action.action}
              priority="primary"
            />
          ))}
        </div>
      ) : null}
    </MetadataUiClientForm>
  );
}

export default MetadataUiFormRenderer;
