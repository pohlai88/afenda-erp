import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type { HrBonusPageModel } from "./hr.payroll.bonus.page-model.server";
import {
  hrBonusCyclesSurfaceKey,
  hrBonusDiscretionarySurfaceKey,
  hrBonusEligibilityRulesSurfaceKey,
  hrBonusGuaranteedRulesSurfaceKey,
  hrBonusManualAdjustmentsSurfaceKey,
  hrBonusMultipliersSurfaceKey,
  hrBonusParticipantsSurfaceKey,
  hrBonusPlansSurfaceKey,
  hrBonusProrationsSurfaceKey,
  hrBonusRecoveriesSurfaceKey,
  hrBonusTargetsSurfaceKey,
} from "./hr.payroll.bonus-search-params.parse.shared";
import { hrBonusUiCopy } from "./hr.payroll.bonus-ui.copy.shared";

const bonusForbiddenState = {
  variant: "forbidden" as const,
  title: hrBonusUiCopy.accessDenied.title,
  description: hrBonusUiCopy.accessDenied.description,
};

function HrBonusListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: HrBonusPageModel["guaranteedRulesList"];
}) {
  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      forbidden={bonusForbiddenState}
      layout="embedded"
    />
  );
}

export function HrBonusAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrBonusUiCopy.accessDenied.title}
      description={hrBonusUiCopy.accessDenied.description}
    />
  );
}

/** BON-001..018 — foundation lists plus rules, multipliers, proration, adjustments, discretionary, recoveries. */
export function HrBonusWorkbenchSection({
  pageModel,
}: {
  pageModel: HrBonusPageModel;
}) {
  const copy = hrBonusUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />

      <HrBonusListSection
        title={copy.plans.surfaceHeaderTitle}
        description="Create and maintain bonus and incentive plans (HRM-BON-001, HRM-BON-002)."
        surfaceKey={hrBonusPlansSurfaceKey}
        listConfiguration={pageModel.plansList}
      />
      <HrBonusListSection
        title={copy.eligibilityRules.surfaceHeaderTitle}
        description="Eligibility by entity, department, grade, role, tenure, rating, and status (HRM-BON-003)."
        surfaceKey={hrBonusEligibilityRulesSurfaceKey}
        listConfiguration={pageModel.eligibilityRulesList}
      />
      <HrBonusListSection
        title={copy.participants.surfaceHeaderTitle}
        description="Assign eligible employees; ineligible employees are flagged (HRM-BON-004)."
        surfaceKey={hrBonusParticipantsSurfaceKey}
        listConfiguration={pageModel.participantsList}
      />
      <HrBonusListSection
        title={copy.cycles.surfaceHeaderTitle}
        description="Cycle period, cutoff, approval, and payout dates (HRM-BON-005)."
        surfaceKey={hrBonusCyclesSurfaceKey}
        listConfiguration={pageModel.cyclesList}
      />
      <HrBonusListSection
        title={copy.targets.surfaceHeaderTitle}
        description="Individual, team, department, company, sales, revenue, profit, project, and KPI targets (HRM-BON-006)."
        surfaceKey={hrBonusTargetsSurfaceKey}
        listConfiguration={pageModel.targetsList}
      />
      <HrBonusListSection
        title={copy.guaranteedRules.surfaceHeaderTitle}
        description="Minimum guaranteed payout rules by plan (HRM-BON-013)."
        surfaceKey={hrBonusGuaranteedRulesSurfaceKey}
        listConfiguration={pageModel.guaranteedRulesList}
      />
      <HrBonusListSection
        title={copy.multipliers.surfaceHeaderTitle}
        description="Company, department, team, and individual performance multipliers (HRM-BON-014)."
        surfaceKey={hrBonusMultipliersSurfaceKey}
        listConfiguration={pageModel.multipliersList}
      />
      <HrBonusListSection
        title={copy.prorations.surfaceHeaderTitle}
        description="Proration for new joiners, resignations, unpaid leave, and partial periods (HRM-BON-015)."
        surfaceKey={hrBonusProrationsSurfaceKey}
        listConfiguration={pageModel.prorationsList}
      />
      <HrBonusListSection
        title={copy.manualAdjustments.surfaceHeaderTitle}
        description="Manual adjustments with justification and approval reference (HRM-BON-016)."
        surfaceKey={hrBonusManualAdjustmentsSurfaceKey}
        listConfiguration={pageModel.manualAdjustmentsList}
      />
      <HrBonusListSection
        title={copy.discretionary.surfaceHeaderTitle}
        description="Discretionary bonus recommendations before payout approval (HRM-BON-017)."
        surfaceKey={hrBonusDiscretionarySurfaceKey}
        listConfiguration={pageModel.discretionaryList}
      />
      <HrBonusListSection
        title={copy.recoveries.surfaceHeaderTitle}
        description="Commission reversal, payout correction, overpayment recovery, and clawback (HRM-BON-018)."
        surfaceKey={hrBonusRecoveriesSurfaceKey}
        listConfiguration={pageModel.recoveriesList}
      />
    </div>
  );
}
