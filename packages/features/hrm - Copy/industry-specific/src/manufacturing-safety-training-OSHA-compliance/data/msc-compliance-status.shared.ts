import type { HrmMscComplianceStatus } from "../schemas/msc-workflow-state.shared"
import type { HrmMscTrainingCategory } from "../schemas/msc-workflow-state.shared"

const MSC_EXPIRY_WARNING_DAYS = 30

export type MscRequirementNeeds = {
  readonly requiresMachineSafety: boolean
  readonly requiresPpeTraining: boolean
  readonly requiresPpeAcknowledgment: boolean
  readonly requiresChemicalHandling: boolean
  readonly requiresFireSafety: boolean
  readonly requiresErgonomics: boolean
  readonly requiresWorkplaceHazard: boolean
  readonly requiresSafetyCertification: boolean
}

export type MscTrainingSnapshot = {
  readonly completionStatus: string
  readonly completedAt: Date | null
  readonly ppeAcknowledged: boolean
}

export type MscCertSnapshot = {
  readonly certStatus: string
  readonly expiryDate: string | null
}

export type MscObligationComplianceInput = {
  readonly needs: MscRequirementNeeds
  readonly trainings: Readonly<
    Partial<Record<HrmMscTrainingCategory, MscTrainingSnapshot>>
  >
  readonly certification: MscCertSnapshot | null
  readonly waived: boolean
  readonly asOf?: Date
}

function parseIsoDate(value: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function daysBetween(asOf: Date, target: Date): number {
  const ms = target.getTime() - asOf.getTime()
  return Math.floor(ms / (24 * 60 * 60 * 1000))
}

function isExpired(asOf: Date, expiryDate: string | null): boolean {
  const expiry = parseIsoDate(expiryDate)
  if (!expiry) return false
  return daysBetween(asOf, expiry) < 0
}

function isExpiringSoon(asOf: Date, expiryDate: string | null): boolean {
  const expiry = parseIsoDate(expiryDate)
  if (!expiry) return false
  const days = daysBetween(asOf, expiry)
  return days >= 0 && days <= MSC_EXPIRY_WARNING_DAYS
}

function needsAnyRequirement(needs: MscRequirementNeeds): boolean {
  return (
    needs.requiresMachineSafety ||
    needs.requiresPpeTraining ||
    needs.requiresPpeAcknowledgment ||
    needs.requiresChemicalHandling ||
    needs.requiresFireSafety ||
    needs.requiresErgonomics ||
    needs.requiresWorkplaceHazard ||
    needs.requiresSafetyCertification
  )
}

function trainingSatisfied(
  needs: boolean,
  snapshot: MscTrainingSnapshot | undefined,
  requirePpeAck: boolean
): boolean {
  if (!needs) return true
  if (!snapshot) return false
  if (snapshot.completionStatus === "waived") return true
  if (
    snapshot.completionStatus !== "completed" &&
    snapshot.completionStatus !== "renewed"
  ) {
    return false
  }
  if (requirePpeAck && !snapshot.ppeAcknowledged) return false
  return Boolean(snapshot.completedAt)
}

const TRAINING_NEED_MAP: ReadonlyArray<{
  needKey: keyof MscRequirementNeeds
  category: HrmMscTrainingCategory
  ppeAck?: boolean
}> = [
  { needKey: "requiresMachineSafety", category: "machine_safety" },
  { needKey: "requiresPpeTraining", category: "ppe" },
  { needKey: "requiresPpeAcknowledgment", category: "ppe", ppeAck: true },
  { needKey: "requiresChemicalHandling", category: "chemical" },
  { needKey: "requiresFireSafety", category: "fire" },
  { needKey: "requiresErgonomics", category: "ergonomics" },
  { needKey: "requiresWorkplaceHazard", category: "workplace_hazard" },
]

/**
 * HRM-MSC-008–010 — single calculator for obligation status, overview, and exports.
 */
export function computeMscObligationComplianceStatus(
  input: MscObligationComplianceInput
): HrmMscComplianceStatus {
  const asOf = input.asOf ?? new Date()

  if (input.waived) return "waived"
  if (!needsAnyRequirement(input.needs)) return "not_required"

  for (const mapping of TRAINING_NEED_MAP) {
    if (!input.needs[mapping.needKey]) continue
    const snapshot = input.trainings[mapping.category]
    if (!trainingSatisfied(true, snapshot, mapping.ppeAck === true)) {
      return "missing"
    }
  }

  if (input.needs.requiresSafetyCertification) {
    const cert = input.certification
    if (!cert || cert.certStatus === "pending" || !cert.certStatus) {
      return "missing"
    }
    if (
      cert.certStatus === "expired" ||
      cert.certStatus === "revoked" ||
      isExpired(asOf, cert.expiryDate)
    ) {
      return "expired"
    }
    if (cert.certStatus === "active" && isExpiringSoon(asOf, cert.expiryDate)) {
      return "expiring"
    }
    if (cert.certStatus !== "active" && cert.certStatus !== "waived") {
      return "pending"
    }
  }

  return "compliant"
}

export function computeMscObligationStatusAfterIdentification(): HrmMscComplianceStatus {
  return "pending"
}

export function isEligibleForSafetyWorkFromComplianceStatus(
  status: HrmMscComplianceStatus
): boolean {
  return status === "compliant" || status === "waived"
}

export type MscComplianceFlags = {
  readonly missingMandatoryTraining: boolean
  readonly expiredOrExpiringCert: boolean
  readonly workRestrictionRecommended: boolean
}

/** HRM-MSC-009–011 — derived flags for overview segmentation. */
export function deriveMscComplianceFlags(
  input: MscObligationComplianceInput & {
    readonly status: HrmMscComplianceStatus
  }
): MscComplianceFlags {
  const asOf = input.asOf ?? new Date()
  const cert = input.certification
  return {
    missingMandatoryTraining:
      input.status === "missing" || input.status === "pending",
    expiredOrExpiringCert:
      input.needs.requiresSafetyCertification &&
      Boolean(
        cert &&
        (cert.certStatus === "expired" ||
          isExpired(asOf, cert.expiryDate) ||
          isExpiringSoon(asOf, cert.expiryDate))
      ),
    workRestrictionRecommended:
      input.status === "missing" ||
      input.status === "expired" ||
      input.status === "rejected",
  }
}
