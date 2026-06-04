"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import {
  Button,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  Input,
  NativeSelect,
  NativeSelectOption,
  Textarea,
} from "@afenda/ui";
import { UploadIcon } from "lucide-react";
import { useActionState } from "react";
import type {
  CreateSystemAdminImportJobActionData,
  SystemAdminImportTemplate,
} from "./sys-import-job.contract";
import {
  SYSTEM_ADMIN_IMPORT_FILENAME_MAX_LENGTH,
  SYSTEM_ADMIN_IMPORT_SOURCE_LABEL_MAX_LENGTH,
} from "./sys-data-management.limits.shared";
import type { SystemAdminActionResult } from "../tenant-execution/sys-action-result.contract";
import { systemAdminDataManagementUiCopy } from "./sys-data-management-ui.copy.shared";

type CreateImportJobFormAction = (
  state: SystemAdminActionResult<CreateSystemAdminImportJobActionData> | undefined,
  payload: FormData,
) => Promise<
  SystemAdminActionResult<CreateSystemAdminImportJobActionData> | undefined
>;

export function SystemAdminCreateImportJobForm({
  templates,
  createImportJobFormAction,
}: {
  templates: readonly SystemAdminImportTemplate[];
  createImportJobFormAction: CreateImportJobFormAction;
}) {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult<CreateSystemAdminImportJobActionData> | undefined,
    FormData
  >(createImportJobFormAction, undefined);
  const copy = systemAdminDataManagementUiCopy.create;
  const disabled = pending || templates.length === 0;

  return (
    <form
      action={formAction}
      className="@container"
      data-testid="system-admin-data-management-create-form"
    >
      <FieldGroup className="grid gap-surface-md @lg:grid-cols-[1fr_1fr_auto]">
        <Field>
          <FieldLabel>{copy.templateLabel}</FieldLabel>
          <NativeSelect name="templateId" required disabled={disabled}>
            {templates.map((template) => (
              <NativeSelectOption key={template.id} value={template.id}>
                {template.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldDescription>
            Templates control headers, adapter, target domain, and retry safety.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel>{copy.sourceLabel}</FieldLabel>
          <Input
            name="sourceLabel"
            maxLength={SYSTEM_ADMIN_IMPORT_SOURCE_LABEL_MAX_LENGTH}
            placeholder="Quarterly access review"
            required
            disabled={disabled}
          />
        </Field>

        <Field>
          <FieldLabel>{copy.filenameLabel}</FieldLabel>
          <Input
            name="filename"
            maxLength={SYSTEM_ADMIN_IMPORT_FILENAME_MAX_LENGTH}
            placeholder="access-review.csv"
            disabled={disabled}
          />
        </Field>

        <Field className="@lg:col-span-3">
          <FieldLabel>{copy.sourceDataLabel}</FieldLabel>
          <Textarea
            name="sourceData"
            required
            disabled={disabled}
            rows={8}
            placeholder={copy.sourceDataPlaceholder}
          />
          <FieldDescription>
            Raw source is parsed server-side and is not stored as an uploaded file.
          </FieldDescription>
        </Field>

        <div className="@lg:col-span-3 flex flex-wrap items-center gap-surface-sm">
          <Button
            type="submit"
            disabled={disabled}
            data-testid="system-admin-data-management-create-submit"
          >
            <UploadIcon data-icon="inline-start" />
            {pending ? "Staging..." : copy.submitLabel}
          </Button>
          <ActionFormErrors result={state} />
          {state?.ok && state.data ? (
            <p className="type-muted">
              Job {state.data.jobId} staged with {state.data.totalRows} rows and{" "}
              {state.data.failedRows} failed row(s).
            </p>
          ) : null}
        </div>
      </FieldGroup>
    </form>
  );
}
