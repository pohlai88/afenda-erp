import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmMscEmployeeObligation } from "@afenda/platform/db/schema"

import { loadMscObligationComplianceContexts } from "./msc-compliance-context.server"
import type { HrmMscComplianceStatus } from "../schemas/msc-workflow-state.shared"

export type MscOrgComplianceSummary = {
  readonly totalObligations: number
  readonly compliant: number
  readonly pending: number
  readonly missing: number
  readonly expiring: number
  readonly expired: number
  readonly rejected: number
  readonly waived: number
  readonly notRequired: number
  readonly missingMandatoryTraining: number
  readonly expiredOrExpiringCert: number
  readonly workRestrictionRecommended: number
}

const EMPTY_SUMMARY: MscOrgComplianceSummary = {
  totalObligations: 0,
  compliant: 0,
  pending: 0,
  missing: 0,
  expiring: 0,
  expired: 0,
  rejected: 0,
  waived: 0,
  notRequired: 0,
  missingMandatoryTraining: 0,
  expiredOrExpiringCert: 0,
  workRestrictionRecommended: 0,
}

function bumpStatus(
  summary: MscOrgComplianceSummary,
  status: HrmMscComplianceStatus
): MscOrgComplianceSummary {
  switch (status) {
    case "compliant":
      return { ...summary, compliant: summary.compliant + 1 }
    case "pending":
      return { ...summary, pending: summary.pending + 1 }
    case "missing":
      return { ...summary, missing: summary.missing + 1 }
    case "expiring":
      return { ...summary, expiring: summary.expiring + 1 }
    case "expired":
      return { ...summary, expired: summary.expired + 1 }
    case "rejected":
      return { ...summary, rejected: summary.rejected + 1 }
    case "waived":
      return { ...summary, waived: summary.waived + 1 }
    case "not_required":
      return { ...summary, notRequired: summary.notRequired + 1 }
    default:
      return summary
  }
}

/** HRM-MSC-028 — org-wide compliance KPI inputs for overview stat cards. */
export async function summarizeMscOrgCompliance(
  organizationId: string
): Promise<MscOrgComplianceSummary> {
  const obligations = await db.query.hrmMscEmployeeObligation.findMany({
    where: eq(hrmMscEmployeeObligation.organizationId, organizationId),
    columns: { id: true },
  })
  if (obligations.length === 0) return EMPTY_SUMMARY

  const contexts = await loadMscObligationComplianceContexts({
    organizationId,
    obligationIds: obligations.map((row) => row.id),
  })

  let summary: MscOrgComplianceSummary = {
    ...EMPTY_SUMMARY,
    totalObligations: obligations.length,
  }

  for (const ctx of contexts.values()) {
    summary = bumpStatus(summary, ctx.status)
    if (ctx.flags.missingMandatoryTraining) {
      summary = {
        ...summary,
        missingMandatoryTraining: summary.missingMandatoryTraining + 1,
      }
    }
    if (ctx.flags.expiredOrExpiringCert) {
      summary = {
        ...summary,
        expiredOrExpiringCert: summary.expiredOrExpiringCert + 1,
      }
    }
    if (ctx.flags.workRestrictionRecommended) {
      summary = {
        ...summary,
        workRestrictionRecommended: summary.workRestrictionRecommended + 1,
      }
    }
  }

  return summary
}
