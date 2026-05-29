import "server-only"

import type { MscEvidenceLinkRow } from "./msc-evidence.server"
import { listMscEvidenceLinksForOrg } from "./msc-evidence.server"
import type { MscOrgComplianceSummary } from "./msc-overview.server"
import { summarizeMscOrgCompliance } from "./msc-overview.server"
import {
  listMscCertificationsForOrg,
  listMscCorrectiveActionsForOrg,
  listMscEmployeeObligationsForOrg,
  listMscHazardAssessmentsForOrg,
  listMscIncidentsForOrg,
  listMscMachinesForOrg,
  listMscRegulatoryReferencesForOrg,
  listMscRequirementRulesForOrg,
  listMscSiteMasterRowsForOrg,
  listMscSitesForOrg,
  listMscWorkRestrictionsForOrg,
} from "./msc.queries.server"
import type {
  MscCertificationRow,
  MscCorrectiveActionRow,
  MscEmployeeObligationRow,
  MscHazardAssessmentRow,
  MscIncidentRow,
  MscMachineRow,
  MscRegulatoryReferenceRow,
  MscRequirementRuleRow,
  MscSiteChoiceRow,
  MscSiteMasterRow,
  MscWorkRestrictionRow,
} from "./msc.types.shared"

export type ManufacturingSafetyPageData = {
  readonly summary: MscOrgComplianceSummary
  readonly sites: readonly MscSiteChoiceRow[]
  readonly siteMasters: readonly MscSiteMasterRow[]
  readonly machines: readonly MscMachineRow[]
  readonly requirementRules: readonly MscRequirementRuleRow[]
  readonly regulatoryReferences: readonly MscRegulatoryReferenceRow[]
  readonly obligations: readonly MscEmployeeObligationRow[]
  readonly certifications: readonly MscCertificationRow[]
  readonly workRestrictions: readonly MscWorkRestrictionRow[]
  readonly hazardAssessments: readonly MscHazardAssessmentRow[]
  readonly incidents: readonly MscIncidentRow[]
  readonly correctiveActions: readonly MscCorrectiveActionRow[]
  readonly evidenceLinks: readonly MscEvidenceLinkRow[]
}

export async function loadManufacturingSafetyPageData(
  organizationId: string
): Promise<ManufacturingSafetyPageData> {
  const [
    summary,
    sites,
    siteMasters,
    machines,
    requirementRules,
    regulatoryReferences,
    obligations,
    certifications,
    workRestrictions,
    hazardAssessments,
    incidents,
    correctiveActions,
    evidenceLinks,
  ] = await Promise.all([
    summarizeMscOrgCompliance(organizationId),
    listMscSitesForOrg(organizationId),
    listMscSiteMasterRowsForOrg(organizationId),
    listMscMachinesForOrg(organizationId),
    listMscRequirementRulesForOrg(organizationId),
    listMscRegulatoryReferencesForOrg(organizationId),
    listMscEmployeeObligationsForOrg(organizationId),
    listMscCertificationsForOrg(organizationId),
    listMscWorkRestrictionsForOrg(organizationId),
    listMscHazardAssessmentsForOrg(organizationId),
    listMscIncidentsForOrg(organizationId),
    listMscCorrectiveActionsForOrg(organizationId),
    listMscEvidenceLinksForOrg(organizationId),
  ])

  return {
    summary,
    sites,
    siteMasters,
    machines,
    requirementRules,
    regulatoryReferences,
    obligations,
    certifications,
    workRestrictions,
    hazardAssessments,
    incidents,
    correctiveActions,
    evidenceLinks,
  }
}
