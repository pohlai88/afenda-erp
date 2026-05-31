import {
  createHrSbsBenchmarkMappingInTx,
  listHrSbsBenchmarkMappingsWindow,
  reviewHrSbsBenchmarkMappingInTx,
  runWithOrganizationContext,
  submitHrSbsBenchmarkMappingForApprovalInTx,
} from "@afenda/db";

import type { HrSbsCreateMappingInput } from "../schemas/hr.payroll.sbs-mapping.schema";

export async function createHrSbsBenchmarkMapping(input: {
  organizationId: string;
  actorUserId: string;
} & HrSbsCreateMappingInput) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    createHrSbsBenchmarkMappingInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      benchmarkVersionId: input.benchmarkVersionId,
      benchmarkEntryId: input.benchmarkEntryId,
      employeeId: input.employeeId,
      legalEntityCode: input.legalEntityCode,
      country: input.country,
      locationCode: input.locationCode,
      jobFamily: input.jobFamily,
      jobTitle: input.jobTitle,
      grade: input.grade,
      employmentCategory: input.employmentCategory,
      submitForApproval: input.submitForApproval,
    }),
  );
}

export async function submitHrSbsBenchmarkMapping(input: {
  organizationId: string;
  actorUserId: string;
  mappingId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    submitHrSbsBenchmarkMappingForApprovalInTx(db, input),
  );
}

export async function reviewHrSbsBenchmarkMapping(input: {
  organizationId: string;
  actorUserId: string;
  mappingId: string;
  decision: "approved" | "rejected";
  decisionNote?: string | null;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    reviewHrSbsBenchmarkMappingInTx(db, input),
  );
}

export async function listHrSbsBenchmarkMappings(input: {
  organizationId: string;
  benchmarkVersionId?: string;
  mappingStatus?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return listHrSbsBenchmarkMappingsWindow(input);
}
