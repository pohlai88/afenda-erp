import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildRecruitmentOffersListSurfaceConfiguration } from "../data/recruitment-offers-list-surface.server"
import type { JobOfferRow } from "../data/recruitment.queries.server"

import { RecruitmentOffersTrailingCell } from "./recruitment-offers-trailing-cell.client"

type RecruitmentOffersListSectionProps = {
  orgSlug: string
  offers: readonly JobOfferRow[]
}

function formatCompensation(row: JobOfferRow): string {
  return `${row.compensationAmount ?? "0"} ${row.compensationCurrency}`
}

function dateOnlyLabel(value: Date | null): string {
  return value ? value.toISOString().slice(0, 10) : "Not set"
}

export async function RecruitmentOffersListSection({
  orgSlug,
  offers,
}: RecruitmentOffersListSectionProps) {
  const t = await getTranslations("Erp.Hrm.recruitment")

  const listConfiguration = buildRecruitmentOffersListSurfaceConfiguration(
    offers,
    {
      empty: t("offersEmpty"),
      colCandidate: t("fieldCandidateName"),
      colRole: t("fieldRequisition"),
      colCompensation: t("fieldAmount"),
      colStatus: "Status",
      formatCompensation: (row) =>
        `${formatCompensation(row)} · ${dateOnlyLabel(row.proposedStartDate)}`,
      statusLabel: (status) => t("offerStatus", { status }),
    }
  )

  return (
    <GovernedPatternCListSection
      title={t("offersTitle")}
      listConfiguration={listConfiguration}
      surfaceKey="hrm:recruitment:offers"
      trailingColumn={{
        header: t("colActions"),
        Cell: RecruitmentOffersTrailingCell,
        context: {
          orgSlug,
          labels: {
            approveOffer: t("approveOffer"),
            sendOffer: t("sendOffer"),
            acceptOffer: t("acceptOffer"),
            rejectOffer: t("rejectOffer"),
            withdrawOffer: t("withdrawOffer"),
            convertHire: t("convertHire"),
            fieldEmployeeNumber: t("fieldEmployeeNumber"),
            converted: t("converted"),
          },
          offers,
        },
      }}
    />
  )
}
