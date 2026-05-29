import type { HrmFhcComplianceStatus } from "../schemas/fhc-workflow-state.shared"

const FHC_EXPIRY_WARNING_DAYS = 30

export type FhcRequirementNeeds = {
  readonly requiresPermit: boolean
  readonly requiresHygieneTraining: boolean
  readonly requiresAllergenTraining: boolean
  readonly requiresHealthCertificate: boolean
}

export type FhcPermitSnapshot = {
  readonly permitNumber: string | null
  readonly permitStatus: string
  readonly expiryDate: string | null
}

export type FhcTrainingSnapshot = {
  readonly completedAt: Date | null
}

export type FhcHealthSnapshot = {
  readonly healthStatus: string
  readonly expiresAt: string | null
}

export type FhcObligationComplianceInput = {
  readonly needs: FhcRequirementNeeds
  readonly permit: FhcPermitSnapshot | null
  readonly hygieneTraining: FhcTrainingSnapshot | null
  readonly allergenTraining: FhcTrainingSnapshot | null
  readonly healthCertificate: FhcHealthSnapshot | null
  readonly verificationRejected: boolean
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
  return days >= 0 && days <= FHC_EXPIRY_WARNING_DAYS
}

function needsAnyRequirement(needs: FhcRequirementNeeds): boolean {
  return (
    needs.requiresPermit ||
    needs.requiresHygieneTraining ||
    needs.requiresAllergenTraining ||
    needs.requiresHealthCertificate
  )
}

/**
 * HRM-FHC-008 — single calculator for obligation status, overview, and exports.
 */
export function computeFhcObligationComplianceStatus(
  input: FhcObligationComplianceInput
): HrmFhcComplianceStatus {
  const asOf = input.asOf ?? new Date()

  if (input.waived) return "waived"
  if (!needsAnyRequirement(input.needs)) return "not_required"
  if (input.verificationRejected) return "rejected"

  const missingPermit =
    input.needs.requiresPermit &&
    (!input.permit ||
      input.permit.permitStatus === "pending" ||
      !input.permit.permitNumber)
  const missingHygiene =
    input.needs.requiresHygieneTraining && !input.hygieneTraining?.completedAt
  const missingAllergen =
    input.needs.requiresAllergenTraining && !input.allergenTraining?.completedAt
  const missingHealth =
    input.needs.requiresHealthCertificate &&
    (!input.healthCertificate ||
      input.healthCertificate.healthStatus === "pending")

  if (missingPermit || missingHygiene || missingAllergen || missingHealth) {
    return "missing"
  }

  const permitExpired =
    input.needs.requiresPermit &&
    input.permit &&
    (input.permit.permitStatus === "expired" ||
      input.permit.permitStatus === "revoked" ||
      isExpired(asOf, input.permit.expiryDate))

  const healthExpired =
    input.needs.requiresHealthCertificate &&
    input.healthCertificate &&
    isExpired(asOf, input.healthCertificate.expiresAt)

  if (permitExpired || healthExpired) return "expired"

  const permitExpiring =
    input.needs.requiresPermit &&
    input.permit &&
    input.permit.permitStatus === "active" &&
    isExpiringSoon(asOf, input.permit.expiryDate)

  const healthExpiring =
    input.needs.requiresHealthCertificate &&
    input.healthCertificate &&
    isExpiringSoon(asOf, input.healthCertificate.expiresAt)

  if (permitExpiring || healthExpiring) return "expiring"

  const permitActive =
    !input.needs.requiresPermit ||
    (input.permit &&
      (input.permit.permitStatus === "active" ||
        input.permit.permitStatus === "waived"))

  const hygieneDone =
    !input.needs.requiresHygieneTraining ||
    Boolean(input.hygieneTraining?.completedAt)

  const allergenDone =
    !input.needs.requiresAllergenTraining ||
    Boolean(input.allergenTraining?.completedAt)

  const healthOk =
    !input.needs.requiresHealthCertificate ||
    (input.healthCertificate &&
      input.healthCertificate.healthStatus !== "pending" &&
      !isExpired(asOf, input.healthCertificate.expiresAt))

  if (permitActive && hygieneDone && allergenDone && healthOk) {
    return "compliant"
  }

  return "pending"
}

/** @deprecated Use {@link computeFhcObligationComplianceStatus}. */
export function computeFhcObligationStatusAfterIdentification(): HrmFhcComplianceStatus {
  return "pending"
}

/**
 * HRM-FHC-009 — scheduling eligibility from computed obligation status.
 */
export function isEligibleForFoodHandlingFromComplianceStatus(
  status: HrmFhcComplianceStatus
): boolean {
  return status === "compliant" || status === "waived"
}

export type FhcComplianceFlags = {
  readonly roleWithoutCert: boolean
  readonly expiredPermit: boolean
  readonly missingHealth: boolean
  readonly overdueTraining: boolean
}

/** HRM-FHC-010–013 — derived flags for overview segmentation. */
export function deriveFhcComplianceFlags(
  input: FhcObligationComplianceInput & {
    readonly status: HrmFhcComplianceStatus
  }
): FhcComplianceFlags {
  const asOf = input.asOf ?? new Date()
  return {
    roleWithoutCert:
      needsAnyRequirement(input.needs) &&
      (input.status === "missing" || input.status === "pending"),
    expiredPermit:
      input.needs.requiresPermit &&
      Boolean(
        input.permit &&
        (input.permit.permitStatus === "expired" ||
          isExpired(asOf, input.permit.expiryDate))
      ),
    missingHealth:
      input.needs.requiresHealthCertificate &&
      (!input.healthCertificate ||
        input.healthCertificate.healthStatus === "pending"),
    overdueTraining:
      (input.needs.requiresHygieneTraining &&
        !input.hygieneTraining?.completedAt) ||
      (input.needs.requiresAllergenTraining &&
        !input.allergenTraining?.completedAt),
  }
}
