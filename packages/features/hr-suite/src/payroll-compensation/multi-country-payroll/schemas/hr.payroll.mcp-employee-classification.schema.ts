import { z } from "zod";

import {
  HR_MCP_STATUTORY_ELIGIBILITY_VALUES,
  HR_MCP_TAX_RESIDENCY_VALUES,
  HR_MCP_WORKER_CATEGORY_VALUES,
} from "./hr.payroll.mcp-constants.shared";
import {
  hrMcpEntityIdSchema,
  hrMcpFormDateTimeInput,
} from "./hr.payroll.mcp-form-fields.shared";

/** MCP-014 — employee tax residency and statutory classifications. */
export const hrMcpUpsertEmployeeClassificationSchema = z.object({
  employeeId: hrMcpEntityIdSchema,
  countryConfigId: hrMcpEntityIdSchema,
  legalEntitySetupId: hrMcpEntityIdSchema.nullable().optional(),
  taxResidency: z.enum(HR_MCP_TAX_RESIDENCY_VALUES),
  workerCategory: z.enum(HR_MCP_WORKER_CATEGORY_VALUES),
  statutoryEligibility: z
    .enum(HR_MCP_STATUTORY_ELIGIBILITY_VALUES)
    .default("pending"),
  effectiveFrom: hrMcpFormDateTimeInput,
  effectiveTo: hrMcpFormDateTimeInput.nullable().optional(),
});

export type HrMcpUpsertEmployeeClassificationInput = z.infer<
  typeof hrMcpUpsertEmployeeClassificationSchema
>;

export const hrMcpEmployeeClassificationRecordSchema =
  hrMcpUpsertEmployeeClassificationSchema.extend({
    id: hrMcpEntityIdSchema,
    organizationId: hrMcpEntityIdSchema,
  });

export type HrMcpEmployeeClassificationRecord = z.infer<
  typeof hrMcpEmployeeClassificationRecordSchema
>;

export const hrMcpEmployeeClassificationSnapshotSchema = z.object({
  taxResidency: z.enum(HR_MCP_TAX_RESIDENCY_VALUES),
  workerCategory: z.enum(HR_MCP_WORKER_CATEGORY_VALUES),
  statutoryEligibility: z.enum(HR_MCP_STATUTORY_ELIGIBILITY_VALUES),
  legalEntitySetupId: hrMcpEntityIdSchema.nullable(),
});

export type HrMcpEmployeeClassificationSnapshot = z.infer<
  typeof hrMcpEmployeeClassificationSnapshotSchema
>;

export const hrMcpUpsertEmployeeClassificationFormSchema =
  hrMcpUpsertEmployeeClassificationSchema;
