import { getTranslations } from "next-intl/server"

import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import {
  listGpgStepEligibleForOrg,
  listGpgStepIncreaseEventsForOrg,
  listGpgStepIncreaseRulesForOrg,
  summarizeGpgStepIncreaseForOrg,
} from "../data/gpg-step-increase.server"
import {
  buildGpgStepEligibleListSurfaceConfiguration,
  buildGpgStepIncreaseEventsListSurfaceConfiguration,
  buildGpgStepIncreaseKpiStatConfiguration,
  buildGpgStepIncreaseRulesListSurfaceConfiguration,
} from "../data/gpg-surface-builders.server"
import {
  GPG_LIST_SURFACE_IDS,
  GPG_STAT_SURFACE_KEY,
} from "../data/gpg-surface-metadata.shared"
import { GpgStepIncreaseAutoBatchButton } from "./gpg-step-increase-auto-batch-button.client"
import { GpgStepIncreaseRuleCreateDialog } from "./gpg-step-increase-rule-create-dialog.client"
import {
  GpgStepEligibleTrailingCell,
  GpgStepEventTrailingCell,
} from "./gpg-list-trailing-cells.client"

export async function GpgStepIncreaseSection({
  organizationId,
  orgSlug,
  canManage,
}: {
  organizationId: string
  orgSlug: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.governmentPayGrades")
  const [summary, rules, eligible, events] = await Promise.all([
    summarizeGpgStepIncreaseForOrg(organizationId),
    listGpgStepIncreaseRulesForOrg(organizationId),
    listGpgStepEligibleForOrg(organizationId),
    listGpgStepIncreaseEventsForOrg(organizationId),
  ])

  const kpiConfiguration = buildGpgStepIncreaseKpiStatConfiguration(summary, {
    eligible: t("kpiEligibleForStep"),
    pending: t("kpiPendingApproval"),
    activeRules: t("kpiActiveStepRules"),
  })

  const rulesConfiguration = buildGpgStepIncreaseRulesListSurfaceConfiguration(
    rules,
    {
      empty: t("stepRulesEmpty"),
      colCode: t("colCode"),
      colName: t("colName"),
      colWaitingMonths: t("colWaitingMonths"),
      colApproval: t("colApprovalMode"),
      colState: t("colState"),
      approvalLabel: (requiresApproval) =>
        requiresApproval ? t("approvalRequired") : t("approvalAutomatic"),
      stateLabel: (state) => t(`masterStateLabels.${state}`),
    }
  )

  const eligibleConfiguration = buildGpgStepEligibleListSurfaceConfiguration(
    eligible,
    orgSlug,
    {
      empty: t("stepEligibleEmpty"),
      colEmployee: t("colEmployee"),
      colPayGrade: t("colPayGrade"),
      colStep: t("colStep"),
      colNextStep: t("colNextStep"),
      colEligibility: t("colEligibilityDate"),
      colRule: t("colRule"),
      colReady: t("colReadyStatus"),
      colPerformance: t("colPerformance"),
      formatDaysUntil: (days) =>
        days <= 0 ? t("eligibleNow") : t("eligibleInDays", { days }),
      formatPerformance: (row) => {
        if (row.managerRating == null) return t("performanceNotRated")
        const rating = row.managerRating
        return row.performanceGateMet
          ? t("performanceGateMet", { rating })
          : t("performanceGateBlocked", { rating })
      },
    },
    canManage
      ? { canManage: true, queueLabel: t("queueStepIncrease") }
      : undefined
  )

  const eventsConfiguration =
    buildGpgStepIncreaseEventsListSurfaceConfiguration(
      events,
      orgSlug,
      {
        empty: t("stepEventsEmpty"),
        colEmployee: t("colEmployee"),
        colRule: t("colRule"),
        colPayGrade: t("colPayGrade"),
        colFromStep: t("colFromStep"),
        colToStep: t("colToStep"),
        colEligibility: t("colEligibilityDate"),
        colState: t("colState"),
        stateLabel: (state) => t(`stepEventStateLabels.${state}`),
      },
      canManage
        ? { canManage: true, decideLabel: t("decideStepIncrease") }
        : undefined
    )

  return (
    <>
      <div data-testid="gpg-step-increase-kpi">
        <GovernedPatternBStatSection
          title={t("stepIncreaseTitle")}
          description={t("stepIncreaseDescription")}
          surfaceKey={GPG_STAT_SURFACE_KEY}
          statGroups={[
            {
              groupKey: "step-increase",
              configuration: kpiConfiguration,
            },
          ]}
          headerAction={
            canManage ? <GpgStepIncreaseAutoBatchButton /> : undefined
          }
        />
      </div>

      <Card size="sm" data-testid="gpg-step-increase-rules-section">
        <CardHeader>
          <CardTitle>{t("stepRulesTitle")}</CardTitle>
          <CardDescription>{t("stepRulesDescription")}</CardDescription>
          {canManage ? (
            <CardAction>
              <GpgStepIncreaseRuleCreateDialog />
            </CardAction>
          ) : null}
        </CardHeader>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          description=""
          surfaceKey={GPG_LIST_SURFACE_IDS.stepIncreaseRules}
          listConfiguration={rulesConfiguration}
        />
      </Card>

      <Card size="sm" data-testid="gpg-step-eligible-section">
        <CardHeader>
          <CardTitle>{t("stepEligibleTitle")}</CardTitle>
          <CardDescription>{t("stepEligibleDescription")}</CardDescription>
        </CardHeader>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          description=""
          surfaceKey={GPG_LIST_SURFACE_IDS.stepEligible}
          listConfiguration={eligibleConfiguration}
          trailingColumn={
            canManage
              ? {
                  header: t("colActions"),
                  Cell: GpgStepEligibleTrailingCell,
                  context: { eligible },
                }
              : undefined
          }
        />
      </Card>

      <Card size="sm" data-testid="gpg-step-increase-events-section">
        <CardHeader>
          <CardTitle>{t("stepEventsTitle")}</CardTitle>
          <CardDescription>{t("stepEventsDescription")}</CardDescription>
        </CardHeader>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          description=""
          surfaceKey={GPG_LIST_SURFACE_IDS.stepIncreaseEvents}
          listConfiguration={eventsConfiguration}
          trailingColumn={
            canManage
              ? {
                  header: t("colActions"),
                  Cell: GpgStepEventTrailingCell,
                  context: {
                    events: events.map((event) => ({
                      id: event.id,
                      state: event.state,
                    })),
                  },
                }
              : undefined
          }
        />
      </Card>
    </>
  )
}
