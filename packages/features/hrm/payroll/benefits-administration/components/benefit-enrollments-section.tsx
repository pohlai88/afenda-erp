import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildBenefitEnrollmentsListSurfaceConfiguration } from "../data/benefit-list-surface.server"
import {
  isBenefitCoverageLevel,
  isBenefitEnrollmentState,
  type BenefitCoverageLevel,
  type BenefitEnrollmentState,
} from "../data/benefit-helpers.shared"
import type { BenefitEnrollmentListRow } from "../data/benefit-model.shared"

import { BenefitEnrollmentTrailingCell } from "./benefit-enrollments-trailing-cell.client"

type BenefitEnrollmentsSectionProps = {
  orgSlug: string
  isAdmin: boolean
  rows: readonly BenefitEnrollmentListRow[]
}

function isoDay(value: Date | null): string {
  if (!value) return ""
  return value.toISOString().slice(0, 10)
}

export async function BenefitEnrollmentsSection({
  orgSlug,
  isAdmin,
  rows,
}: BenefitEnrollmentsSectionProps) {
  const t = await getTranslations("Erp.Hrm.benefits.enrollmentTable")

  function coverageLabel(coverageLevel: BenefitCoverageLevel): string {
    switch (coverageLevel) {
      case "employee_only":
        return t("coverageLevels.employee_only")
      case "employee_spouse":
        return t("coverageLevels.employee_spouse")
      case "employee_children":
        return t("coverageLevels.employee_children")
      case "employee_family":
        return t("coverageLevels.employee_family")
    }
  }

  function enrollmentStateLabel(state: BenefitEnrollmentState): string {
    switch (state) {
      case "pending":
        return t("states.pending")
      case "active":
        return t("states.active")
      case "waived":
        return t("states.waived")
      case "terminated":
        return t("states.terminated")
      case "suspended":
        return t("states.suspended")
      case "expired":
        return t("states.expired")
    }
  }

  const listConfiguration = buildBenefitEnrollmentsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("empty"),
      colEmployee: t("colEmployee"),
      colPlan: t("colPlan"),
      colCoverage: t("colCoverage"),
      colState: t("colState"),
      colEffective: t("colEffective"),
      formatEmployee: (row) =>
        `${row.employeeLegalName} (${row.employeeNumber})`,
      formatPlan: (row) => `${row.benefitName} · ${row.benefitCode}`,
      formatCoverage: (row) =>
        row.coverageLevel && isBenefitCoverageLevel(row.coverageLevel)
          ? coverageLabel(row.coverageLevel)
          : (row.coverageLevel ?? "—"),
      formatState: (row) =>
        isBenefitEnrollmentState(row.state)
          ? enrollmentStateLabel(row.state)
          : row.state,
      formatEffective: (row) => {
        const from = isoDay(row.effectiveFrom)
        return row.effectiveTo ? `${from} — ${isoDay(row.effectiveTo)}` : from
      },
    },
    { showTrailing: isAdmin }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:benefits:enrollments"
      resolveConfiguredPermission={false}
      trailingColumn={
        isAdmin
          ? {
              header: t("colActions"),
              Cell: BenefitEnrollmentTrailingCell,
              context: {
                enrollments: rows.map((row) => ({
                  enrollmentId: row.enrollmentId,
                  state: row.state,
                })),
              },
            }
          : undefined
      }
    />
  )
}
