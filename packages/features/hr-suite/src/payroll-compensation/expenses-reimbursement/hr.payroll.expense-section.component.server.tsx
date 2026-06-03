import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import type { ComponentType } from "react";
import { SectionPanel } from "@afenda/ui";

import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client";

import type { HrExpensePageModel } from "./hr.payroll.expense.page-model.server";
import {
  hrExpenseAuditTrailSurfaceKey,
  hrExpenseClaimsSurfaceKey,
  hrExpenseReportsSurfaceKey,
} from "./hr.payroll.expense-search-params.parse.shared";
import { HrExpenseClaimSubmitForm } from "./hr.payroll.expense-claim-form.component.client";
import { HrExpenseClaimsTrailingCell } from "./hr.payroll.expense-list-trailing.component.client";
import { hrExpenseUiCopy } from "./hr.payroll.expense-ui.copy.shared";

const expenseForbiddenState = {
  variant: "forbidden" as const,
  title: hrExpenseUiCopy.accessDenied.title,
  description: hrExpenseUiCopy.accessDenied.description,
};

function HrExpenseListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
  TrailingCell,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: HrExpensePageModel["claimsList"];
  TrailingCell?: ComponentType<GovernedListTrailingCellProps>;
}) {
  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      forbidden={expenseForbiddenState}
      layout="embedded"
      {...(TrailingCell
        ? {
            trailingColumn: {
              header: hrExpenseUiCopy.claims.colActions,
              Cell: TrailingCell,
            },
          }
        : {})}
    />
  );
}

export function HrExpenseAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={1}
      title={hrExpenseUiCopy.accessDenied.title}
      description={hrExpenseUiCopy.accessDenied.description}
    />
  );
}

export function HrExpenseWorkbenchSection({
  pageModel,
}: {
  pageModel: HrExpensePageModel;
}) {
  const copy = hrExpenseUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />

      {pageModel.canWrite ? (
        <SectionPanel
          title={copy.submit.sectionTitle}
          description={copy.submit.sectionDescription}
        >
          <HrExpenseClaimSubmitForm />
        </SectionPanel>
      ) : null}

      <HrExpenseListSection
        title={copy.claims.sectionTitle}
        description={copy.claims.sectionDescription}
        surfaceKey={hrExpenseClaimsSurfaceKey}
        listConfiguration={pageModel.claimsList}
        TrailingCell={
          pageModel.canApprove || pageModel.canWrite
            ? HrExpenseClaimsTrailingCell
            : undefined
        }
      />

      <HrExpenseListSection
        title={copy.reports.sectionTitle}
        description={copy.reports.sectionDescription}
        surfaceKey={hrExpenseReportsSurfaceKey}
        listConfiguration={pageModel.reportsList}
      />

      <HrExpenseListSection
        title={copy.audit.sectionTitle}
        description={copy.audit.sectionDescription}
        surfaceKey={hrExpenseAuditTrailSurfaceKey}
        listConfiguration={pageModel.auditTrailList}
      />
    </div>
  );
}
