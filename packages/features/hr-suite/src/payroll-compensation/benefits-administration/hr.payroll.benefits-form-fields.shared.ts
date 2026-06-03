import { z } from "zod";

export const hrBenefitsEntityIdSchema = z.string().trim().min(1).max(64);

export const hrBenefitsFormDateTimeInput = z
  .union([z.string(), z.date()])
  .transform((value, ctx) => {
    if (value instanceof Date) {
      return value;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid date" });
      return z.NEVER;
    }
    return parsed;
  });

export const nullableScopeText = z.string().trim().min(1).max(200).optional();
