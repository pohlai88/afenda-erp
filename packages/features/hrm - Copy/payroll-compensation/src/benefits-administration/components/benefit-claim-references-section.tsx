import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { isBenefitClaimStatus } from "../data/benefit-helpers.shared"
import { buildBenefitClaimReferencesListSurfaceConfiguration } from "../data/benefit-list-surface.server"
import type { BenefitClaimReferenceRow } from "../data/benefit-claim-reference.queries.server"

import { BenefitClaimReferenceCreateDialog } from "./benefit-claim-reference-create-dialog"
import type {
  BenefitEnrollmentChoice,
  BenefitProviderChoice,
} from "./benefit-claim-reference-form"
import { BenefitClaimReferenceTrailingCell } from "./benefit-list-trailing-cells.client"

type BenefitClaimReferencesSectionProps = {
  isAdmin: boolean
  rows: readonly BenefitClaimReferenceRow[]
  enrollments: readonly BenefitEnrollmentChoice[]
  providers: readonly BenefitProviderChoice[]
  enrollmentLabels: ReadonlyMap<string, string>
}

export async function BenefitClaimReferencesSection({
  isAdmin,
  rows,
  enrollments,
  providers,
  enrollmentLabels,
}: BenefitClaimReferencesSectionProps) {
  const [tSection, t] = await Promise.all([
    getTranslations("Erp.Hrm.benefits"),
    getTranslations("Erp.Hrm.benefits.claimReferencesTable"),
  ])

  const listConfiguration = buildBenefitClaimReferencesListSurfaceConfiguration(
    rows,
    {
      empty: isAdmin ? t("emptyAdmin") : t("emptyMember"),
      colExternalId: t("colExternalId"),
      colEnrollment: t("colEnrollment"),
      colStatus: t("colStatus"),
      colAmount: t("colAmount"),
      colPaymentRef: t("colPaymentRef"),
      claimStatusLabel: (status) =>
        isBenefitClaimStatus(status) ? t(`claimStatuses.${status}`) : status,
      enrollmentLabel: (enrollmentId) =>
        enrollmentLabels.get(enrollmentId) ?? enrollmentId,
    }
  )

  return (
    <GovernedPatternCListSection
      title={tSection("tabClaimReferencesTitle")}
      description={tSection("tabClaimReferencesDescription")}
      listConfiguration={listConfiguration}
      surfaceKey="hrm:benefits:claim-references"
      cardClassName="mt-0 border-solid border-border"
      headerSlot={
        isAdmin ? (
          <div className="mb-3 flex justify-end">
            <BenefitClaimReferenceCreateDialog
              enrollments={enrollments}
              providers={providers}
            />
          </div>
        ) : null
      }
      trailingColumn={
        isAdmin
          ? {
              header: t("colActions"),
              Cell: BenefitClaimReferenceTrailingCell,
              context: {
                rows: rows.map((row) => ({
                  id: row.id,
                  claimStatus: row.claimStatus,
                  claimedAmount: row.claimedAmount,
                  paymentReference: row.paymentReference,
                })),
              },
            }
          : undefined
      }
    />
  )
}
