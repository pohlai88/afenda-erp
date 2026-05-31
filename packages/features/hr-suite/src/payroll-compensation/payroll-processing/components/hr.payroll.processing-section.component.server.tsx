import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";

import { hrPayrollProcessingRoutePaths } from "../contracts/hr.payroll.processing-route.contract";
import type {
  HrPayrollAuditPageModel,
  HrPayrollPageModel,
} from "../data/hr.payroll.processing.page-model.server";
import {
  hrPayrollAssignmentsSurfaceKey,
  hrPayrollAuditSurfaceKey,
  hrPayrollCyclesSurfaceKey,
  hrPayrollPayGroupsSurfaceKey,
  hrPayrollPaymentsSurfaceKey,
  hrPayrollPayslipsSurfaceKey,
  hrPayrollRunsSurfaceKey,
} from "../data/hr.payroll.processing-search-params.parse.shared";
import { hrPayrollUiCopy } from "../surface/hr.payroll.processing-ui.copy.shared";

const payrollForbiddenState = {
  variant: "forbidden" as const,
  title: hrPayrollUiCopy.accessDenied.title,
  description: hrPayrollUiCopy.accessDenied.description,
};

function HrPayrollListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: HrPayrollPageModel["cyclesList"];
}) {
  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      forbidden={payrollForbiddenState}
      layout="embedded"
    />
  );
}

export function HrPayrollAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrPayrollUiCopy.accessDenied.title}
      description={hrPayrollUiCopy.accessDenied.description}
    />
  );
}

function HrPayrollSectionNav({ active }: { active: "hub" | "audit" }) {
  const copy = hrPayrollUiCopy.nav;
  const linkClass = (key: typeof active) =>
    key === active
      ? "type-control font-medium text-foreground"
      : "type-muted hover:text-foreground";

  return (
    <nav className="flex gap-surface-lg border-b border-border pb-3">
      <Link className={linkClass("hub")} href={hrPayrollProcessingRoutePaths.hub}>
        {copy.hub}
      </Link>
      <Link className={linkClass("audit")} href={hrPayrollProcessingRoutePaths.audit}>
        {copy.audit}
      </Link>
    </nav>
  );
}

export function HrPayrollWorkbenchSection({
  pageModel,
}: {
  pageModel: HrPayrollPageModel;
}) {
  const copy = hrPayrollUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />
      <HrPayrollSectionNav active="hub" />
      <HrPayrollListSection
        title={copy.cycles.surfaceHeaderTitle}
        description="Payroll cycles by pay group, period, cutoff, and pay date (HRM-PAY-001)."
        surfaceKey={hrPayrollCyclesSurfaceKey}
        listConfiguration={pageModel.cyclesList}
      />
      <HrPayrollListSection
        title={copy.payGroups.surfaceHeaderTitle}
        description="Monthly, weekly, bi-weekly, semi-monthly, and ad hoc pay schedules (HRM-PAY-002)."
        surfaceKey={hrPayrollPayGroupsSurfaceKey}
        listConfiguration={pageModel.payGroupsList}
      />
      <HrPayrollListSection
        title={copy.assignments.surfaceHeaderTitle}
        description="Employee pay group assignments (HRM-PAY-003)."
        surfaceKey={hrPayrollAssignmentsSurfaceKey}
        listConfiguration={pageModel.assignmentsList}
      />
      <HrPayrollListSection
        title={copy.runs.surfaceHeaderTitle}
        description="Payroll calculation runs with validation and approval workflow (HRM-PAY-017..023)."
        surfaceKey={hrPayrollRunsSurfaceKey}
        listConfiguration={pageModel.runsList}
      />
      <HrPayrollListSection
        title={copy.payslips.surfaceHeaderTitle}
        description="Employee payslips after payroll close (HRM-PAY-024..025)."
        surfaceKey={hrPayrollPayslipsSurfaceKey}
        listConfiguration={pageModel.payslipsList}
      />
      <HrPayrollListSection
        title={copy.payments.surfaceHeaderTitle}
        description="Payment batches and bank file generation (HRM-PAY-026..027)."
        surfaceKey={hrPayrollPaymentsSurfaceKey}
        listConfiguration={pageModel.paymentsList}
      />
    </div>
  );
}

export function HrPayrollAuditSection({
  pageModel,
}: {
  pageModel: HrPayrollAuditPageModel;
}) {
  const copy = hrPayrollUiCopy.audit;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.pageTitle}
        description={copy.pageDescription}
      />
      <HrPayrollSectionNav active="audit" />
      <HrPayrollListSection
        title={copy.surfaceHeaderTitle}
        description="Every payroll calculation, adjustment, approval, and payment creates an audit event (HRM-PAY-030)."
        surfaceKey={hrPayrollAuditSurfaceKey}
        listConfiguration={pageModel.auditList}
      />
    </div>
  );
}
