import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmFhcEmployeeObligation } from "@afenda/platform/db/schema"

import { loadFhcObligationComplianceContexts } from "./fhc-compliance-context.server"
import type { HrmFhcComplianceStatus } from "../schemas/fhc-workflow-state.shared"

export type FhcOrgComplianceSummary = {
  readonly totalObligations: number
  readonly compliant: number
  readonly pending: number
  readonly missing: number
  readonly expiring: number
  readonly expired: number
  readonly rejected: number
  readonly waived: number
  readonly notRequired: number
  readonly roleWithoutCert: number
  readonly expiredPermit: number
  readonly missingHealth: number
  readonly overdueTraining: number
}

const EMPTY_SUMMARY: FhcOrgComplianceSummary = {
  totalObligations: 0,
  compliant: 0,
  pending: 0,
  missing: 0,
  expiring: 0,
  expired: 0,
  rejected: 0,
  waived: 0,
  notRequired: 0,
  roleWithoutCert: 0,
  expiredPermit: 0,
  missingHealth: 0,
  overdueTraining: 0,
}

function bumpStatus(
  summary: FhcOrgComplianceSummary,
  status: HrmFhcComplianceStatus
): FhcOrgComplianceSummary {
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

/** HRM-FHC-022 — org-wide compliance KPI inputs for overview stat cards. */
export async function summarizeFhcOrgCompliance(
  organizationId: string
): Promise<FhcOrgComplianceSummary> {
  const obligations = await db.query.hrmFhcEmployeeObligation.findMany({
    where: eq(hrmFhcEmployeeObligation.organizationId, organizationId),
    columns: { id: true },
  })
  if (obligations.length === 0) return EMPTY_SUMMARY

  const contexts = await loadFhcObligationComplianceContexts({
    organizationId,
    obligationIds: obligations.map((row) => row.id),
  })

  let summary: FhcOrgComplianceSummary = {
    ...EMPTY_SUMMARY,
    totalObligations: obligations.length,
  }

  for (const ctx of contexts.values()) {
    summary = bumpStatus(summary, ctx.status)
    if (ctx.flags.roleWithoutCert) {
      summary = { ...summary, roleWithoutCert: summary.roleWithoutCert + 1 }
    }
    if (ctx.flags.expiredPermit) {
      summary = { ...summary, expiredPermit: summary.expiredPermit + 1 }
    }
    if (ctx.flags.missingHealth) {
      summary = { ...summary, missingHealth: summary.missingHealth + 1 }
    }
    if (ctx.flags.overdueTraining) {
      summary = { ...summary, overdueTraining: summary.overdueTraining + 1 }
    }
  }

  return summary
}
