import { z } from "zod";

import { HRM_BENEFIT_OPEN_ENROLLMENT_STATUSES } from "./hr.payroll.benefits-constants.shared";
import {
  hrBenefitsEntityIdSchema,
  hrBenefitsFormDateTimeInput,
} from "./hr.payroll.benefits-form-fields.shared";

export const upsertHrBenefitOpenEnrollmentWindowFormSchema = z
  .object({
    code: z.string().trim().min(1).max(100),
    name: z.string().trim().min(1).max(500),
    enrollmentStartAt: hrBenefitsFormDateTimeInput,
    enrollmentEndAt: hrBenefitsFormDateTimeInput,
    coverageEffectiveFrom: hrBenefitsFormDateTimeInput,
    coverageEffectiveTo: hrBenefitsFormDateTimeInput.optional(),
    status: z.enum(HRM_BENEFIT_OPEN_ENROLLMENT_STATUSES).optional(),
    planIds: z
      .union([z.string(), z.array(z.string())])
      .transform((value) => {
        if (Array.isArray(value)) {
          return value.map((entry) => entry.trim()).filter(Boolean);
        }
        return value
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean);
      })
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.enrollmentEndAt.getTime() < value.enrollmentStartAt.getTime()) {
      ctx.addIssue({
        code: "custom",
        message: "Enrollment end must be on or after enrollment start",
        path: ["enrollmentEndAt"],
      });
    }
  });

export type UpsertHrBenefitOpenEnrollmentWindowFormInput = z.infer<
  typeof upsertHrBenefitOpenEnrollmentWindowFormSchema
>;

export const activateHrBenefitOpenEnrollmentWindowFormSchema = z.object({
  windowId: hrBenefitsEntityIdSchema,
});
