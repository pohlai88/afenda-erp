export type ComplianceTrailingSelectFieldConfig = {
  kind: "select";
  name: string;
  label: string;
  options: readonly string[];
  defaultValue?: string;
  defaultFromCell?: string;
};

export type ComplianceTrailingTextFieldConfig = {
  kind: "text";
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
};

export type ComplianceTrailingDateTimeFieldConfig = {
  kind: "datetime-local";
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  defaultFromCell?: string;
};

export type ComplianceTrailingFieldConfig =
  | ComplianceTrailingSelectFieldConfig
  | ComplianceTrailingTextFieldConfig
  | ComplianceTrailingDateTimeFieldConfig;

export type ComplianceTrailingActionConfig = {
  submitLabel: string;
  buttonVariant?: "default" | "secondary" | "outline";
  hiddenFieldName: string;
  fields: ComplianceTrailingFieldConfig[];
};
