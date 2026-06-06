import "server-only";

import type { ReactNode } from "react";
import {
  Checkbox,
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type { MetadataUiActionContract } from "../contracts/action.contract";
import type {
  MetadataUiFormField,
  MetadataUiFormFieldKind,
  MetadataUiFormSection,
} from "../schemas/form.schema";
import { MetadataUiPrimitiveActionButton } from "./action-button.server";

export type MetadataUiPrimitiveFieldProps = Readonly<{
  field: MetadataUiFormField;
  mode?: MetadataUiPrimitiveFieldMode;
}>;

export type MetadataUiPrimitiveFieldMode =
  | "create"
  | "edit"
  | "view"
  | "review";

export type MetadataUiPrimitiveFieldControlKind =
  | "hidden"
  | "text"
  | "textarea"
  | "select"
  | "multi-select"
  | "boolean"
  | "checkbox-group"
  | "radio"
  | "custom";

export type MetadataUiPrimitiveFieldGroupProps = Readonly<{
  section: MetadataUiFormSection;
  children: ReactNode;
  eyebrow?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
}>;

const TEXT_INPUT_KIND_TO_TYPE = {
  text: "text",
  number: "number",
  currency: "number",
  percentage: "number",
  date: "date",
  datetime: "datetime-local",
  file: "file",
} as const satisfies Partial<Record<MetadataUiFormFieldKind, string>>;

function getMetadataUiPrimitiveFieldId(field: MetadataUiFormField): string {
  return `metadata-ui-field-${field.key}`;
}

function stringifyMetadataUiFieldValue(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return undefined;
}

function stringifyMetadataUiFieldValueSet(value: unknown): ReadonlySet<string> {
  if (!Array.isArray(value)) {
    return new Set();
  }

  return new Set(
    value
      .map((item) => stringifyMetadataUiFieldValue(item))
      .filter((item): item is string => item !== undefined),
  );
}

function isMetadataUiFieldDisabled(
  field: MetadataUiFormField,
  mode: MetadataUiPrimitiveFieldMode | undefined,
): boolean {
  return Boolean(
    field.disabled?.value ||
      field.readonly ||
      field.state.value === "readonly" ||
      field.state.value === "review" ||
      field.state.value === "pending" ||
      field.state.value === "blocked" ||
      mode === "view" ||
      mode === "review",
  );
}

function isMetadataUiFieldInvalid(field: MetadataUiFormField): boolean {
  return field.state.value === "invalid";
}

function isMetadataUiFieldGroupDisabled(section: MetadataUiFormSection): boolean {
  return section.fields.length > 0 && section.fields.every((field) =>
    isMetadataUiFieldDisabled(field, "view"),
  );
}

function getMetadataUiFieldDescribedBy(field: MetadataUiFormField): string | undefined {
  const fieldId = getMetadataUiPrimitiveFieldId(field);
  const describedBy = [
    field.description ? `${fieldId}-description` : undefined,
    field.validation?.message ? `${fieldId}-validation` : undefined,
    field.state.reason ? `${fieldId}-state-reason` : undefined,
    field.state.errors.length > 0 ? `${fieldId}-errors` : undefined,
    field.disabled?.value && field.disabled.reason
      ? `${fieldId}-disabled-reason`
      : undefined,
    field.kind === "file" && field.fileUpload?.description
      ? `${fieldId}-upload-description`
      : undefined,
  ].filter((id): id is string => id !== undefined);

  return describedBy.length > 0 ? describedBy.join(" ") : undefined;
}

function getMetadataUiOptionId(
  field: MetadataUiFormField,
  optionIndex: number,
): string {
  return `${getMetadataUiPrimitiveFieldId(field)}-option-${optionIndex}`;
}

function renderMetadataUiCheckboxOptionGroup(
  field: MetadataUiFormField,
  disabled: boolean,
) {
  const selectedValues = stringifyMetadataUiFieldValueSet(field.defaultValue);

  return (
    <FieldGroup data-slot="checkbox-group" className={ui.surfaceGap.xs}>
      {field.options.map((option, optionIndex) => {
        const optionValue = String(option.value);
        const optionId = getMetadataUiOptionId(field, optionIndex);

        return (
          <Field key={optionValue} orientation="horizontal">
            <Checkbox
              id={optionId}
              name={field.name}
              value={optionValue}
              defaultChecked={selectedValues.has(optionValue)}
              disabled={disabled || option.disabled}
            />
            <FieldLabel htmlFor={optionId}>{option.label}</FieldLabel>
          </Field>
        );
      })}
    </FieldGroup>
  );
}

function renderMetadataUiPrimitiveFieldControl(
  field: MetadataUiFormField,
  mode: MetadataUiPrimitiveFieldMode | undefined,
) {
  const disabled = isMetadataUiFieldDisabled(field, mode);
  const fieldId = getMetadataUiPrimitiveFieldId(field);
  const commonProps = {
    id: fieldId,
    name: field.name,
    disabled,
    required: field.validation?.required,
    "aria-describedby": getMetadataUiFieldDescribedBy(field),
    "aria-invalid": isMetadataUiFieldInvalid(field) || undefined,
    "data-metadata-ui-field-state": field.state.value,
    "data-testid": field.diagnostics?.testId,
  };

  if (field.kind === "hidden") {
    return (
      <Input
        {...commonProps}
        type="hidden"
        defaultValue={stringifyMetadataUiFieldValue(field.defaultValue)}
      />
    );
  }

  if (field.kind === "textarea") {
    return (
      <Textarea
        {...commonProps}
        placeholder={field.placeholder}
        defaultValue={stringifyMetadataUiFieldValue(field.defaultValue)}
        readOnly={field.readonly}
      />
    );
  }

  if (field.kind === "select") {
    return (
      <Select
        name={field.name}
        disabled={disabled}
        defaultValue={stringifyMetadataUiFieldValue(field.defaultValue)}
      >
        <SelectTrigger
          id={commonProps.id}
          aria-describedby={commonProps["aria-describedby"]}
          aria-invalid={commonProps["aria-invalid"]}
          aria-required={commonProps.required || undefined}
          className="w-full"
          data-metadata-ui-field-state={
            commonProps["data-metadata-ui-field-state"]
          }
          data-testid={commonProps["data-testid"]}
        >
          <SelectValue placeholder={field.placeholder ?? "Select"} />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((option) => (
            <SelectItem
              key={String(option.value)}
              value={String(option.value)}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.kind === "multi-select") {
    return renderMetadataUiCheckboxOptionGroup(field, disabled);
  }

  if (field.kind === "boolean") {
    return (
      <Switch
        {...commonProps}
        defaultChecked={Boolean(field.defaultValue)}
      />
    );
  }

  if (field.kind === "checkbox-group") {
    return renderMetadataUiCheckboxOptionGroup(field, disabled);
  }

  if (field.kind === "radio" || field.kind === "custom") {
    return (
      <Input
        {...commonProps}
        type="text"
        placeholder={field.placeholder}
        defaultValue={stringifyMetadataUiFieldValue(field.defaultValue)}
        readOnly
      />
    );
  }

  return (
    <Input
      {...commonProps}
      type={TEXT_INPUT_KIND_TO_TYPE[field.kind] ?? "text"}
      placeholder={field.placeholder}
      defaultValue={stringifyMetadataUiFieldValue(field.defaultValue)}
      readOnly={field.readonly}
      accept={field.kind === "file" ? field.fileUpload?.accept.join(",") : undefined}
      multiple={field.kind === "file" ? field.fileUpload?.multiple : undefined}
      data-host-upload-key={
        field.kind === "file" ? field.fileUpload?.hostUploadKey : undefined
      }
      min={field.validation?.min}
      max={field.validation?.max}
      minLength={field.validation?.minLength}
      maxLength={field.validation?.maxLength}
      pattern={field.validation?.pattern}
    />
  );
}

export function MetadataUiPrimitiveFieldGroup({
  section,
  children,
  eyebrow,
  meta,
  actions,
  footer,
  className,
  bodyClassName,
}: MetadataUiPrimitiveFieldGroupProps) {
  return (
    <FieldSet
      className={cn(ui.surface.inset, ui.surfaceGap.sm, className)}
      data-collapsible={section.collapsible || undefined}
      data-default-collapsed={section.defaultCollapsed || undefined}
      data-disabled={isMetadataUiFieldGroupDisabled(section) || undefined}
    >
      {(eyebrow || section.title || meta || actions) ? (
        <div className="flex flex-wrap items-start justify-between gap-surface-sm">
          <div className="grid min-w-0 gap-surface-2xs">
            {eyebrow ? (
              <p className={cn(ui.typography.label, ui.color.ink.muted)}>
                {eyebrow}
              </p>
            ) : null}
            {section.title ? <FieldLegend>{section.title}</FieldLegend> : null}
            {meta ? (
              <p className={cn(ui.typography.caption, ui.color.ink.muted)}>
                {meta}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-surface-xs">{actions}</div> : null}
        </div>
      ) : null}
      {section.description ? (
        <FieldDescription>{section.description}</FieldDescription>
      ) : null}
      <FieldGroup
        className={cn("grid md:grid-cols-2", ui.surfaceGap.sm, bodyClassName)}
      >
        {children}
      </FieldGroup>
      {footer ? <div className="flex flex-wrap items-center gap-surface-xs">{footer}</div> : null}
    </FieldSet>
  );
}

export function MetadataUiPrimitiveField({
  field,
  mode = "view",
}: MetadataUiPrimitiveFieldProps) {
  if (field.hidden) {
    return renderMetadataUiPrimitiveFieldControl(field, mode);
  }

  const fieldId = getMetadataUiPrimitiveFieldId(field);
  const disabledReason =
    field.disabled?.value ? field.disabled.reason : undefined;
  const stateReason = field.state.reason;

  return (
    <Field
      data-disabled={isMetadataUiFieldDisabled(field, mode)}
      data-invalid={isMetadataUiFieldInvalid(field) || undefined}
      data-metadata-ui-field-state={field.state.value}
      data-metadata-ui-dependent-field={
        field.dependencies.length > 0 ? "true" : undefined
      }
    >
      <FieldContent>
        <FieldLabel htmlFor={fieldId}>
          {field.label}
          {field.validation?.required ? <span aria-hidden="true">*</span> : null}
        </FieldLabel>
        {field.description ? (
          <FieldDescription id={`${fieldId}-description`}>
            {field.description}
          </FieldDescription>
        ) : null}
      </FieldContent>
      {renderMetadataUiPrimitiveFieldControl(field, mode)}
      {field.kind === "file" && field.fileUpload?.description ? (
        <FieldDescription id={`${fieldId}-upload-description`}>
          {field.fileUpload.description}
        </FieldDescription>
      ) : null}
      {field.kind === "file" && field.fileUpload ? (
        <FieldDescription>
          Upload status: {field.fileUpload.status}
          {field.fileUpload.maxSizeBytes
            ? `; max ${field.fileUpload.maxSizeBytes} bytes`
            : ""}
        </FieldDescription>
      ) : null}
      {field.kind === "file" && field.fileUpload?.existingFiles.length ? (
        <ul className="list-disc pl-5 text-sm">
          {field.fileUpload.existingFiles.map((file) => (
            <li key={file.key}>
              <span>{file.fileName}</span>
              <span className="ml-2 inline-flex gap-surface-2xs">
                {file.downloadAction ? (
                  <MetadataUiPrimitiveActionButton
                    action={file.downloadAction as MetadataUiActionContract}
                    priority="tertiary"
                    label="Download"
                  />
                ) : null}
                {file.removeAction ? (
                  <MetadataUiPrimitiveActionButton
                    action={file.removeAction as MetadataUiActionContract}
                    priority="tertiary"
                    label="Remove"
                  />
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {field.kind === "file" && field.fileUpload?.uploadAction ? (
        <MetadataUiPrimitiveActionButton
          action={field.fileUpload.uploadAction as MetadataUiActionContract}
          priority="secondary"
          label={field.fileUpload.uploadAction.label}
        />
      ) : null}
      {field.kind === "file" && field.fileUpload?.blockedReason ? (
        <FieldDescription>{field.fileUpload.blockedReason}</FieldDescription>
      ) : null}
      {disabledReason ? (
        <FieldDescription id={`${fieldId}-disabled-reason`}>
          {disabledReason}
        </FieldDescription>
      ) : null}
      {stateReason ? (
        <FieldDescription id={`${fieldId}-state-reason`}>
          {stateReason}
        </FieldDescription>
      ) : null}
      {field.validation?.message ? (
        <FieldDescription id={`${fieldId}-validation`}>
          {field.validation.message}
        </FieldDescription>
      ) : null}
      {field.state.errors.length > 0 ? (
        <FieldDescription id={`${fieldId}-errors`}>
          {field.state.errors.map((error) => error.message).join(" ")}
        </FieldDescription>
      ) : null}
    </Field>
  );
}
