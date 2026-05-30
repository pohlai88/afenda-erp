import { z } from "zod";

/** Afenda entity ids from `createEntityId()` — not RFC-4122 UUID strings. */
export const hrComplianceEntityIdSchema = z.string().trim().min(1).max(128);

export const COMPLIANCE_NATIVE_SELECT_CLASS =
  "h-9 w-full rounded-control border border-input bg-background px-3 type-control";

export function formatComplianceEnumLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Formats stored timestamps for HTML `datetime-local` inputs (UTC components). */
export function formatComplianceDateTimeLocalInput(
  value: Date | null | undefined,
): string {
  if (!value) {
    return "";
  }

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}T${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}`;
}

export function readOptionalComplianceFormField(
  formData: FormData,
  key: string,
): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** Reads a text field when present in the form, including empty strings. */
export function readComplianceFormTextField(
  formData: FormData,
  key: string,
): string | undefined {
  if (!formData.has(key)) {
    return undefined;
  }

  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

/** Accepts ISO datetimes and `datetime-local` values from HTML forms. */
export const hrComplianceFormDateTimeInput = z
  .string()
  .trim()
  .min(1)
  .superRefine((value, ctx) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid date and time.",
      });
    }
  })
  .transform((value) => new Date(value));

export const hrComplianceFormNullableDateTimeInput = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (value.length === 0) {
      return;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid date and time.",
      });
    }
  })
  .transform((value) => (value.length === 0 ? null : new Date(value)));

export const hrComplianceFormNullableReviewNotesInput = z
  .string()
  .trim()
  .max(2000)
  .transform((value) => value || null);

export const hrComplianceFormNullableDocumentNumberInput = z
  .string()
  .trim()
  .max(120)
  .transform((value) => value || null);
