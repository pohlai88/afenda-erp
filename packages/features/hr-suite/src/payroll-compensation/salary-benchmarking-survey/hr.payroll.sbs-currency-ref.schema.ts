import { z } from "zod";

import { HR_SBS_CURRENCY_RATE_SOURCES } from "./hr.payroll.sbs-constants.shared";

/** SBS-024 — currency conversion reference for cross-country benchmark comparison. */
export const hrSbsCurrencyRefSchema = z
  .object({
    fromCurrencyCode: z.string().length(3),
    toCurrencyCode: z.string().length(3),
    exchangeRate: z.number().positive(),
    effectiveDate: z.coerce.date(),
    rateSource: z.enum(HR_SBS_CURRENCY_RATE_SOURCES).default("manual"),
    benchmarkVersionId: z.string().min(1).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const from = data.fromCurrencyCode.trim().toUpperCase();
    const to = data.toCurrencyCode.trim().toUpperCase();
    if (from === to) {
      ctx.addIssue({
        code: "custom",
        message: "From and to currency codes must differ.",
        path: ["toCurrencyCode"],
      });
    }
  });

export const hrSbsListCurrencyRefsQuerySchema = z.object({
  fromCurrencyCode: z.string().length(3).optional(),
  toCurrencyCode: z.string().length(3).optional(),
  benchmarkVersionId: z.string().min(1).optional(),
  effectiveOnOrBefore: z.coerce.date().optional(),
  effectiveOnOrAfter: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

export const hrSbsCurrencyConversionLookupSchema = z.object({
  fromCurrencyCode: z.string().length(3),
  toCurrencyCode: z.string().length(3),
  effectiveDate: z.coerce.date(),
});

export type HrSbsCurrencyRefInput = z.infer<typeof hrSbsCurrencyRefSchema>;
