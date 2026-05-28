import "server-only"

import { listUcbCollectiveAgreementsForOrg } from "./ucb-cba.server"
import { listUcbGrievancesForOrg } from "./ucb-grievance.server"
import { summarizeUcbOrgOverview } from "./ucb-overview.server"

export type UcbAlertRow = {
  id: string
  kind: "expiring_agreement" | "open_grievance" | "compliance"
  title: string
  detail: string
}

export async function listUcbAlertsForOrg(
  organizationId: string
): Promise<UcbAlertRow[]> {
  const [overview, agreements, grievances] = await Promise.all([
    summarizeUcbOrgOverview(organizationId),
    listUcbCollectiveAgreementsForOrg(organizationId),
    listUcbGrievancesForOrg(organizationId),
  ])

  const alerts: UcbAlertRow[] = []
  const today = new Date().toISOString().slice(0, 10)
  const windowEnd = new Date()
  windowEnd.setDate(windowEnd.getDate() + 90)

  for (const agreement of agreements) {
    if (agreement.status !== "active" || !agreement.effectiveTo) continue
    if (
      agreement.effectiveTo >= today &&
      agreement.effectiveTo <= windowEnd.toISOString().slice(0, 10)
    ) {
      alerts.push({
        id: `expiry:${agreement.id}`,
        kind: "expiring_agreement",
        title: agreement.title,
        detail: `Expires ${agreement.effectiveTo}`,
      })
    }
  }

  for (const grievance of grievances) {
    if (
      grievance.status === "resolved" ||
      grievance.status === "withdrawn" ||
      grievance.status === "closed"
    ) {
      continue
    }
    alerts.push({
      id: `grievance:${grievance.id}`,
      kind: "open_grievance",
      title: grievance.summary.slice(0, 80),
      detail: `${grievance.employeeLabel} · ${grievance.status}`,
    })
  }

  if (overview.unresolvedComplianceFindings > 0) {
    alerts.push({
      id: "compliance:summary",
      kind: "compliance",
      title: "Unresolved compliance findings",
      detail: String(overview.unresolvedComplianceFindings),
    })
  }

  return alerts
}
