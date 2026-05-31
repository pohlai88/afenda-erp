import {
  bulkUpsertHrSalaryBenchmarkEntriesInTx,
  createHrSalaryBenchmarkVersionInTx,
  getHrSalaryBenchmarkCurrencyRef,
  getHrSalaryBenchmarkEntryById,
  getHrSalaryBenchmarkVersionSummary,
  listHrSalaryBenchmarkCurrencyRefsWindow,
  listHrSalaryBenchmarkEntriesWindow,
  listHrSalaryBenchmarkVersionsWindow,
  runWithOrganizationContext,
  updateHrSalaryBenchmarkVersionInTx,
  uploadHrSalaryBenchmarkSurveyInTx,
  upsertHrSalaryBenchmarkCurrencyRefInTx,
  upsertHrSalaryBenchmarkEntryInTx,
} from "@afenda/db";

import type { HrSbsBenchmarkValuesInput } from "../schemas/hr.payroll.sbs-benchmark-values.schema";
import type { HrSbsCurrencyRefInput } from "../schemas/hr.payroll.sbs-currency-ref.schema";
import type { HrSbsSurveyUploadInput } from "../schemas/hr.payroll.sbs-survey-upload.schema";

export async function uploadHrSbsSurveyData(input: {
  organizationId: string;
  actorUserId: string;
  survey: HrSbsSurveyUploadInput;
  currencyRefs?: readonly HrSbsCurrencyRefInput[];
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    uploadHrSalaryBenchmarkSurveyInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      code: input.survey.code,
      label: input.survey.label,
      provider: input.survey.provider,
      surveyYear: input.survey.surveyYear,
      effectiveDate: input.survey.effectiveDate,
      sourceReference: input.survey.sourceReference,
      entries: input.survey.entries,
      currencyRefs: input.currencyRefs,
    }),
  );
}

export async function createHrSbsBenchmarkVersion(input: {
  organizationId: string;
  actorUserId: string;
  code: string;
  label: string;
  provider: string;
  surveyYear: number;
  effectiveDate: Date;
  sourceReference?: string | null;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    createHrSalaryBenchmarkVersionInTx(db, input),
  );
}

export async function updateHrSbsBenchmarkVersion(input: {
  organizationId: string;
  actorUserId: string;
  versionId: string;
  label?: string;
  sourceReference?: string | null;
  versionStatus?: "draft" | "active" | "superseded" | "archived";
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    updateHrSalaryBenchmarkVersionInTx(db, input),
  );
}

export async function listHrSbsBenchmarkVersions(input: {
  organizationId: string;
  search?: string;
  provider?: string;
  surveyYear?: number;
  versionStatus?: "draft" | "active" | "superseded" | "archived";
  limit?: number;
  offset?: number;
}) {
  return listHrSalaryBenchmarkVersionsWindow(input);
}

export async function getHrSbsBenchmarkVersion(input: {
  organizationId: string;
  versionId: string;
}) {
  return getHrSalaryBenchmarkVersionSummary(input);
}

export async function upsertHrSbsBenchmarkEntry(input: {
  organizationId: string;
  actorUserId: string;
  versionId: string;
  industry: string;
  country: string;
  location: string;
  jobFamily: string;
  jobLevel: string;
  currencyCode?: string;
} & HrSbsBenchmarkValuesInput) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    upsertHrSalaryBenchmarkEntryInTx(db, input),
  );
}

export async function bulkUpsertHrSbsBenchmarkEntries(input: {
  organizationId: string;
  actorUserId: string;
  versionId: string;
  entries: readonly (Omit<
    Parameters<typeof upsertHrSalaryBenchmarkEntryInTx>[1],
    "organizationId" | "actorUserId" | "versionId"
  >)[];
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    bulkUpsertHrSalaryBenchmarkEntriesInTx(db, input),
  );
}

export async function listHrSbsBenchmarkEntries(input: {
  organizationId: string;
  versionId: string;
  search?: string;
  jobFamily?: string;
  jobLevel?: string;
  country?: string;
  currencyCode?: string;
  limit?: number;
  offset?: number;
}) {
  return listHrSalaryBenchmarkEntriesWindow(input);
}

export async function getHrSbsBenchmarkEntry(input: {
  organizationId: string;
  entryId: string;
}) {
  return getHrSalaryBenchmarkEntryById(input);
}

export async function upsertHrSbsCurrencyRef(input: {
  organizationId: string;
  actorUserId: string;
} & HrSbsCurrencyRefInput) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    upsertHrSalaryBenchmarkCurrencyRefInTx(db, input),
  );
}

export async function listHrSbsCurrencyRefs(input: {
  organizationId: string;
  fromCurrencyCode?: string;
  toCurrencyCode?: string;
  benchmarkVersionId?: string;
  effectiveOnOrBefore?: Date;
  effectiveOnOrAfter?: Date;
  limit?: number;
  offset?: number;
}) {
  return listHrSalaryBenchmarkCurrencyRefsWindow(input);
}

export async function lookupHrSbsCurrencyConversion(input: {
  organizationId: string;
  fromCurrencyCode: string;
  toCurrencyCode: string;
  effectiveDate: Date;
}) {
  return getHrSalaryBenchmarkCurrencyRef(input);
}
