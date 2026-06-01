import { buildGovernedActionBar, type GovernedActionBarConfiguration } from "./build-governed-action-bar";

export type GovernedFormFieldKind = "text" | "textarea" | "number" | "select" | "date" | "checkbox";

export type GovernedFormField = {
  name: string;
  label: string;
  kind: GovernedFormFieldKind;
  required?: boolean;
  helperText?: string;
  options?: readonly { label: string; value: string }[];
};

export type GovernedFormSection = {
  id: string;
  title: string;
  fields: readonly GovernedFormField[];
};

export type GovernedFormSurfaceConfiguration = {
  surfaceId: string;
  title: string;
  description?: string;
  submitActionId: string;
  sections: readonly GovernedFormSection[];
  actions?: GovernedActionBarConfiguration;
};

export function buildGovernedFormSurface(
  input: GovernedFormSurfaceConfiguration,
): GovernedFormSurfaceConfiguration {
  return {
    surfaceId: input.surfaceId,
    title: input.title,
    ...(input.description ? { description: input.description } : {}),
    submitActionId: input.submitActionId,
    sections: input.sections,
    ...(input.actions ? { actions: buildGovernedActionBar(input.actions) } : {}),
  };
}
