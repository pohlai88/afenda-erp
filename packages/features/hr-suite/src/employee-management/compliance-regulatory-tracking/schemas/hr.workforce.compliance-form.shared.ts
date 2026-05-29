import { z } from "zod";

export const COMPLIANCE_NATIVE_SELECT_CLASS =
  "h-9 w-full rounded-control border border-input bg-background px-3 type-control";

export function formatComplianceEnumLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Formats stored timestamps for HTML `datetime-local` inputs. */
export function formatComplianceDateTimeLocalInput(
  value: Date | null | undefined,
): string {
  if (!value) {
    return "";
  }

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function readOptionalComplianceFormField(
  formData: FormData,
  key: string,
): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.length > 0 ? value : undefined;
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
