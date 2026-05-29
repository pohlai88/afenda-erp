"use server"

import { after } from "next/server"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"

import { requireHrmPermission } from "@afenda/feature-hrm-core/governance"
import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import { HRM_EMPLOYEE_ENGAGEMENT_AUDIT } from "../employee-engagement.contract"
import { writeEngagementIamAuditAfterCommit } from "../data/engagement-audit.server"
import {
  computeAndPersistEngagementAnalytics,
  getEngagementAnalyticsSnapshotForSurvey,
  persistEngagementOpenTextTags,
} from "../data/engagement-analytics.server"
import { buildEngagementAnalyticsReportCsv } from "../data/engagement-analytics-report-export.shared"
import { listEngagementImprovementActionsForSurvey } from "../data/engagement-improvement.queries.server"
import {
  revalidateEmployeeEngagementSurveyDetail,
  revalidateEmployeeEngagementSurfaces,
} from "../data/engagement-revalidate.server"
import {
  generateEngagementAnalyticsFormSchema,
  tagEngagementOpenTextFormSchema,
} from "../schemas/engagement-analytics-action.schema"
import type { EngagementDesignFormState } from "../schemas/engagement-form-state.shared"

function revalidateAfterAnalyticsChange(surveyId: string) {
  revalidateEmployeeEngagementSurfaces()
  revalidateEmployeeEngagementSurveyDetail(surveyId)
}

export async function generateEngagementAnalyticsAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "update",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = generateEngagementAnalyticsFormSchema.safeParse({
    surveyId: formData.get("surveyId"),
    externalReference: formData.get("externalReference"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await computeAndPersistEngagementAnalytics({
    organizationId: gate.session.organizationId,
    surveyId: parsed.data.surveyId,
    actorUserId: gate.session.userId,
    externalReference: parsed.data.externalReference,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.message })
  }

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.analytics.calculate,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_analytics",
    resourceId: parsed.data.surveyId,
    metadata: {
      surveyId: parsed.data.surveyId,
      externalReference: parsed.data.externalReference,
    },
  })

  revalidateAfterAnalyticsChange(parsed.data.surveyId)
  return { ok: true }
}

export async function exportEngagementAnalyticsReportCsvAction(input: {
  surveyId: string
}): Promise<
  { ok: true; csv: string; filename: string } | { ok: false; error: string }
> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "audit",
  })
  if (!gate.ok) {
    return { ok: false, error: gate.error }
  }

  const snapshot = await getEngagementAnalyticsSnapshotForSurvey({
    organizationId: gate.session.organizationId,
    surveyId: input.surveyId,
  })

  if (!snapshot) {
    return {
      ok: false,
      error: "Generate analytics before exporting a report.",
    }
  }

  const improvementRows = await listEngagementImprovementActionsForSurvey({
    organizationId: gate.session.organizationId,
    surveyId: input.surveyId,
  })

  const csv = buildEngagementAnalyticsReportCsv(snapshot, improvementRows)
  const asOf = snapshot.generatedAt.slice(0, 10)
  const filename = `employee-engagement-${input.surveyId.slice(0, 8)}-${asOf}.csv`

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.analytics.export,
      actorUserId: gate.session.userId,
      actorSessionId: gate.session.sessionId,
      organizationId: gate.session.organizationId,
      resourceType: "employee_engagement_analytics",
      resourceId: input.surveyId,
      metadata: { surveyId: input.surveyId, filename },
    })
  )

  return { ok: true, csv, filename }
}

export async function tagEngagementOpenTextAction(
  _prev: EngagementDesignFormState | undefined,
  formData: FormData
): Promise<EngagementDesignFormState> {
  const gate = await requireHrmPermission({
    object: "employee_engagement",
    function: "update",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })

  const parsed = tagEngagementOpenTextFormSchema.safeParse({
    surveyId: formData.get("surveyId"),
    reviewId: formData.get("reviewId"),
    tags: formData.get("tags"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await persistEngagementOpenTextTags({
    organizationId: gate.session.organizationId,
    surveyId: parsed.data.surveyId,
    reviewId: parsed.data.reviewId,
    tags: parsed.data.tags,
    actorUserId: gate.session.userId,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.message })
  }

  writeEngagementIamAuditAfterCommit({
    action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.openText.tag,
    actorUserId: gate.session.userId,
    actorSessionId: gate.session.sessionId,
    organizationId: gate.session.organizationId,
    resourceType: "employee_engagement_open_text",
    resourceId: parsed.data.reviewId,
    metadata: {
      surveyId: parsed.data.surveyId,
      tagCount: parsed.data.tags.length,
    },
  })

  revalidateAfterAnalyticsChange(parsed.data.surveyId)
  return { ok: true }
}
