import { z } from "zod";

import type { SchemaStability } from "./_stability.shared";

import { formRuleSchema } from "./form-rules.schema";
import { governedMetadataSchemaVersionSchema } from "./schema-version.shared";
import { governedSurfaceChromeSchema } from "./surface-chrome.schema";

export const GOVERNED_MULTI_STEP_FORM_SCHEMA_ID =
  "governed.multi-step-form.configuration" as const;

export const GOVERNED_MULTI_STEP_FORM_SCHEMA_STABILITY: SchemaStability =
  "beta";

/** Multi-step wizard data nature (ADR-0025 §2). */
export const multiStepFormDataNatureSchema = z.literal("wizard");
export type MultiStepFormDataNature = z.infer<
  typeof multiStepFormDataNatureSchema
>;

export const governedFormFieldKindSchema = z.enum([
  "text",
  "email",
  "textarea",
  "select",
  "checkbox",
  "file-upload",
]);

export const governedFormFieldOptionSchema = z
  .object({
    value: z.string().trim().min(1),
    label: z.string().trim().min(1),
  })
  .strict();

export const governedFormFieldSchema = z
  .object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1),
    kind: governedFormFieldKindSchema,
    required: z.boolean().default(false),
    placeholder: z.string().trim().min(1).optional(),
    options: z.array(governedFormFieldOptionSchema).optional(),
    /** MIME accept string for file-upload fields (defaults to ERP document policy). */
    accept: z.string().trim().min(1).optional(),
    /** Conditional visibility/enablement (JSON Forms–style; evaluated server + client). */
    rules: z.array(formRuleSchema).optional(),
  })
  .strict()
  .superRefine((field, ctx) => {
    if (
      field.kind === "select" &&
      (!field.options || field.options.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select fields require at least one option.",
        path: ["options"],
      });
    }

    if (field.kind !== "select" && field.options !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only select fields may define options.",
        path: ["options"],
      });
    }

    if (field.kind === "file-upload" && field.options !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "File-upload fields must not define select options.",
        path: ["options"],
      });
    }

    if (field.kind !== "file-upload" && field.accept !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only file-upload fields may define accept.",
        path: ["accept"],
      });
    }
  });

export const governedFormStepSchema = z
  .object({
    id: z.string().trim().min(1),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1).optional(),
    fields: z.array(governedFormFieldSchema).min(1),
  })
  .strict()
  .superRefine((step, ctx) => {
    const seen = new Set<string>();

    for (const [index, field] of step.fields.entries()) {
      if (seen.has(field.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Field ids must be unique within a step.",
          path: ["fields", index, "id"],
        });
      }

      seen.add(field.id);
    }
  });

export const governedMultiStepFormConfigurationSchema =
  governedMetadataSchemaVersionSchema
    .extend({
      dataNature: multiStepFormDataNatureSchema.default("wizard"),
      formId: z.string().trim().min(1),
      actionId: z.string().trim().min(1),
      /** Required when any step includes a file-upload field. */
      moduleId: z.string().trim().min(1).optional(),
      steps: z.array(governedFormStepSchema).min(1),
      submitLabel: z.string().trim().min(1).default("Submit"),
      chrome: governedSurfaceChromeSchema.optional(),
    })
    .superRefine((form, ctx) => {
      const seen = new Set<string>();
      const hasFileUpload = form.steps.some((step) =>
        step.fields.some((field) => field.kind === "file-upload"),
      );

      if (hasFileUpload && !form.moduleId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "moduleId is required when the form includes file-upload fields.",
          path: ["moduleId"],
        });
      }

      for (const [index, step] of form.steps.entries()) {
        if (seen.has(step.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Step ids must be unique.",
            path: ["steps", index, "id"],
          });
        }

        seen.add(step.id);
      }
    });

export type GovernedFormFieldKind = z.infer<typeof governedFormFieldKindSchema>;
export type GovernedFormFieldOption = z.infer<
  typeof governedFormFieldOptionSchema
>;
export type GovernedFormField = z.infer<typeof governedFormFieldSchema>;
export type GovernedFormStep = z.infer<typeof governedFormStepSchema>;

export type GovernedMultiStepFormConfiguration = z.infer<
  typeof governedMultiStepFormConfigurationSchema
>;

export type GovernedMultiStepFormConfigurationInput = z.input<
  typeof governedMultiStepFormConfigurationSchema
>;

export function parseGovernedMultiStepFormConfiguration(raw: unknown) {
  return governedMultiStepFormConfigurationSchema.safeParse(raw);
}
