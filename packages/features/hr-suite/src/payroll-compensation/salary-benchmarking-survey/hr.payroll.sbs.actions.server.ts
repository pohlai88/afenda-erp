"use server";

import { runWithOrganizationContext } from "@afenda/db";

import { hrPayrollSbsAuditActions } from "./hr.payroll.sbs-audit.event";
import {
  requireHrSbsApprove,
  requireHrSbsRead,
  requireHrSbsWrite,
} from "./hr.payroll.sbs-access.policy.server";
import { hrSbsRunAnalysisSchema } from "./hr.payroll.sbs-analysis.schema";
import {
  hrSbsCreateMappingSchema,
  hrSbsReviewMappingSchema,
  hrSbsSubmitMappingSchema,
} from "./hr.payroll.sbs-mapping.schema";
import { hrSbsSurveyUploadSchema } from "./hr.payroll.sbs-survey-upload.schema";
import { runHrSbsCompensationAnalysis } from "./hrs-hr-payroll-sbs-analysis-server";
import {
  createHrSbsBenchmarkMapping,
  reviewHrSbsBenchmarkMapping,
  submitHrSbsBenchmarkMapping,
} from "./hrs-hr-payroll-sbs-mapping-server";
import { uploadHrSbsSurveyData } from "./hrs-hr-payroll-sbs-survey-data-server";
import { buildHrSbsBenchmarkReportCsv } from "./hr.payroll.sbs-reports.shared";

export async function uploadHrSbsSurveyAction(input: unknown) {
  const guard = await requireHrSbsWrite();
  const parsed = hrSbsSurveyUploadSchema.parse(input);

  return uploadHrSbsSurveyData({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    survey: parsed,
  });
}

export async function createHrSbsBenchmarkMappingAction(input: unknown) {
  const guard = await requireHrSbsWrite();
  const parsed = hrSbsCreateMappingSchema.parse(input);

  return createHrSbsBenchmarkMapping({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    ...parsed,
  });
}

export async function submitHrSbsBenchmarkMappingAction(input: unknown) {
  const guard = await requireHrSbsWrite();
  const parsed = hrSbsSubmitMappingSchema.parse(input);

  return submitHrSbsBenchmarkMapping({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    mappingId: parsed.mappingId,
  });
}

export async function reviewHrSbsBenchmarkMappingAction(input: unknown) {
  const guard = await requireHrSbsApprove();
  const parsed = hrSbsReviewMappingSchema.parse(input);

  return reviewHrSbsBenchmarkMapping({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    mappingId: parsed.mappingId,
    decision: parsed.decision,
    decisionNote: parsed.decisionNote,
  });
}

export async function runHrSbsAnalysisAction(input: unknown) {
  const guard = await requireHrSbsWrite();
  const parsed = hrSbsRunAnalysisSchema.parse(input);

  return runHrSbsCompensationAnalysis({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    payload: parsed,
  });
}

export async function exportHrSbsBenchmarkReportAction(input: {
  analysisId: string;
}) {
  const guard = await requireHrSbsRead();

  const { listHrSbsCompensationAnalysesWindow } = await import("@afenda/db");
  const window = await listHrSbsCompensationAnalysesWindow({
    organizationId: guard.organization.id,
    pageSize: 100,
  });

  const analysis = window.rows.find((row) => row.analysisId === input.analysisId);
  if (!analysis?.snapshot || typeof analysis.snapshot !== "object") {
    throw new Error("Analysis snapshot not found");
  }

  const snapshot = analysis.snapshot as {
    employeeResults?: Array<{
      employeeId: string;
      marketPosition: string;
      marketRatio: number | null;
      compaRatio: number | null;
      belowTarget: boolean;
      aboveRange: boolean;
    }>;
  };

  const rows = (snapshot.employeeResults ?? []).map((row) => ({
    employeeId: row.employeeId,
    jobFamily: null,
    grade: null,
    departmentId: null,
    legalEntityCode: null,
    country: null,
    locationCode: null,
    marketPosition: row.marketPosition,
    marketRatio: row.marketRatio,
    compaRatio: row.compaRatio,
    belowTarget: row.belowTarget,
    aboveRange: row.aboveRange,
  }));

  await runWithOrganizationContext(guard.organization.id, async (db) => {
    const { appendHrSbsAuditEventInTx } = await import("@afenda/db");
    await appendHrSbsAuditEventInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      action: hrPayrollSbsAuditActions.report.export,
      summary: `Exported benchmark report for analysis ${input.analysisId}`,
      analysisId: input.analysisId,
    });
  });

  return { csv: buildHrSbsBenchmarkReportCsv(rows) };
}
