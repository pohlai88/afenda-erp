import { z } from "zod";

export const hrMcpEntityIdSchema = z.string().trim().min(1).max(64);

export const hrMcpCountryCodeSchema = z
  .string()
  .trim()
  .length(2)
  .transform((value) => value.toUpperCase());

export const hrMcpCurrencyCodeSchema = z
  .string()
  .trim()
  .length(3)
  .transform((value) => value.toUpperCase());

export const hrMcpMoneyAmountSchema = z.number().finite().nonnegative();

export const hrMcpRuleConfigSchema = z.record(z.string(), z.unknown());

export const hrMcpFormDateTimeInput = z
  .union([z.string(), z.date()])
  .transform((value, ctx) => {
    if (value instanceof Date) {
      return value;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid date/time" });
      return z.NEVER;
    }
    return parsed;
  });

export const hrMcpFormDateInput = z
  .union([z.string(), z.date()])
  .transform((value, ctx) => {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    const trimmed = value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      ctx.addIssue({ code: "custom", message: "Invalid date (expected YYYY-MM-DD)" });
      return z.NEVER;
    }
    return trimmed;
  });

export const hrMcpOptionalNumericString = z
  .string()
  .trim()
  .max(32)
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? null : value));

export const hrMcpRequiredNumericString = z
  .string()
  .trim()
  .min(1)
  .max(32);
