import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";

import { hrCpmRoutePaths } from "../contracts/hr.payroll.cpm-route.contract";
import type {
  HrCpmAuditPageModel,
  HrCpmCycleDetailPageModel,
  HrCpmHubPageModel,
  HrCpmReportsPageModel,
} from "../data/hr.payroll.cpm.page-model.server";
import {
  hrCpmAuditSurfaceKey,
  hrCpmCyclesSurfaceKey,
  hrCpmParticipantsSurfaceKey,
  hrCpmRecommendationsSurfaceKey,
  hrCpmReportsSurfaceKey,
} from "../data/hr.payroll.cpm-search-params.parse.shared";
import { hrCpmUiCopy } from "../surface/hr.payroll.cpm-ui.copy.shared";
import { HrCpmSectionNav } from "./hr.payroll.cpm-nav.component.server";

const cpmForbiddenState = {
  variant: "forbidden" as const,
  title: hrCpmUiCopy.accessDenied.title,
  description: hrCpmUiCopy.accessDenied.description,
};

function HrCpmListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: HrCpmHubPageModel["cyclesList"];
}) {
  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      forbidden={cpmForbiddenState}
      layout="embedded"
    />
  );
}

export function HrCpmAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrCpmUiCopy.accessDenied.title}
      description={hrCpmUiCopy.accessDenied.description}
    />
  );
}

export function HrCpmHubSection({ pageModel }: { pageModel: HrCpmHubPageModel }) {
  const copy = hrCpmUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />
      <HrCpmSectionNav active="cycles" />
      <HrCpmListSection
        title={copy.cycles.surfaceHeaderTitle}
        description="Annual, merit, promotion, and adjustment planning cycles (HRM-CPM-001)."
        surfaceKey={hrCpmCyclesSurfaceKey}
        listConfiguration={pageModel.cyclesList}
      />
    </div>
  );
}

export function HrCpmCycleDetailSection({
  pageModel,
}: {
  pageModel: HrCpmCycleDetailPageModel;
}) {
  const copy = hrCpmUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={`${pageModel.cycle.code} — ${pageModel.cycle.name}`}
        description={`${pageModel.cycle.cycleType} · ${pageModel.cycle.cycleStatus} · effective ${pageModel.cycle.effectiveDate.toLocaleDateString()}`}
        actions={
          <Link
            className="type-muted hover:text-foreground"
            href={hrCpmRoutePaths.compensationPlanning}
          >
            {copy.cycleDetail.backLabel}
          </Link>
        }
      />
      <HrCpmSectionNav active="cycles" />
      <HrCpmListSection
        title={copy.participants.surfaceHeaderTitle}
        description="Eligible population and salary snapshots for the cycle (HRM-CPM-004..006)."
        surfaceKey={hrCpmParticipantsSurfaceKey}
        listConfiguration={pageModel.participantsList}
      />
      <HrCpmListSection
        title={copy.recommendations.surfaceHeaderTitle}
        description="Manager and HR recommendations with budget and band checks (HRM-CPM-008..022)."
        surfaceKey={hrCpmRecommendationsSurfaceKey}
        listConfiguration={pageModel.recommendationsList}
      />
    </div>
  );
}

export function HrCpmReportsSection({ pageModel }: { pageModel: HrCpmReportsPageModel }) {
  const copy = hrCpmUiCopy.reports;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.pageTitle}
        description={copy.pageDescription}
      />
      <HrCpmSectionNav active="reports" />
      <HrCpmListSection
        title={copy.surfaceHeaderTitle}
        description="Slice by department, manager, legal entity, grade, budget pool, and approval status (HRM-CPM-029 / AC 20)."
        surfaceKey={hrCpmReportsSurfaceKey}
        listConfiguration={pageModel.reportsList}
      />
    </div>
  );
}

export function HrCpmAuditSection({ pageModel }: { pageModel: HrCpmAuditPageModel }) {
  const copy = hrCpmUiCopy.audit;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.pageTitle}
        description={copy.pageDescription}
      />
      <HrCpmSectionNav active="audit" />
      <HrCpmListSection
        title={copy.surfaceHeaderTitle}
        description="Every compensation planning action records an audit event (HRM-CPM-030 / AC 22)."
        surfaceKey={hrCpmAuditSurfaceKey}
        listConfiguration={pageModel.auditList}
      />
    </div>
  );
}
