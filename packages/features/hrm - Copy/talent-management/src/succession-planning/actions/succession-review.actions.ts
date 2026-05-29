"use server"

import { requireOrgSession, writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import {
  closeSuccessionReviewCycle,
  createSuccessionReviewCycle,
} from "../data/succession-bench.server"
import { buildSuccessionOrgReportCsv } from "../data/succession-reports.server"
import { HRM_SUCCESSION_AUDIT } from "../succession.contract"
import {
  closeReviewCycleFormSchema,
  createReviewCycleFormSchema,
  exportSuccessionReportFormSchema,
  type ExportSuccessionReportFormState,
  type SuccessionMutationFormState,
  withSuccessionNullableFields,
} from "../schemas/succession.schema"

async function requireSuccessionManagePermission(input: {
  organizationId: string
  userId: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "succession",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to manage succession review cycles.",
    })
  }
  return null
}

export async function createSuccessionReviewCycleAction(
  _prev: SuccessionMutationFormState | undefined,
  formData: FormData
): Promise<SuccessionMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireSuccessionManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createReviewCycleFormSchema.safeParse({
    title: formData.get("title"),
    dueDate: formData.get("dueDate") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withSuccessionNullableFields(parsed.data, ["dueDate"])
  const result = await createSuccessionReviewCycle({
    organizationId: session.organizationId,
    userId: session.userId,
    ...data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.reviewCycleId }
}

export async function closeSuccessionReviewCycleAction(
  _prev: SuccessionMutationFormState | undefined,
  formData: FormData
): Promise<SuccessionMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireSuccessionManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = closeReviewCycleFormSchema.safeParse({
    reviewCycleId: formData.get("reviewCycleId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await closeSuccessionReviewCycle({
    organizationId: session.organizationId,
    userId: session.userId,
    reviewCycleId: parsed.data.reviewCycleId,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: parsed.data.reviewCycleId }
}

export async function exportSuccessionReportAction(
  _prev: ExportSuccessionReportFormState | undefined,
  formData: FormData
): Promise<ExportSuccessionReportFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId, sessionId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "succession",
      function: "audit",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to export succession reports.",
    })
  }

  const parsed = exportSuccessionReportFormSchema.safeParse({
    reportKind: formData.get("reportKind") ?? "bench_strength",
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const report = await buildSuccessionOrgReportCsv({
    organizationId,
    reportKind: parsed.data.reportKind,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_SUCCESSION_AUDIT.reportExport,
    actorUserId: userId,
    actorSessionId: sessionId,
    organizationId,
    resourceType: "hrm_succession_report",
    resourceId: report.filename,
    metadata: { rowCount: report.rowCount, reportKind: parsed.data.reportKind },
  })

  return {
    ok: true,
    csv: report.csv,
    filename: report.filename,
    rowCount: report.rowCount,
  }
}
