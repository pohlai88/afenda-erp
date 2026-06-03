import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type {
  HrLmsAuditPageModel,
  HrLmsHubPageModel,
  HrLmsReportsPageModel,
} from "./hr.talent.lms.page-model.server";
import {
  hrLmsAdminOverviewSurfaceKey,
  hrLmsAuditSurfaceKey,
  hrLmsCoursesSurfaceKey,
  hrLmsEmployeeOverviewSurfaceKey,
  hrLmsManagerOverviewSurfaceKey,
  hrLmsReportsSurfaceKey,
} from "./hr.talent.lms-search-params.parse.shared";
import { hrLmsUiCopy } from "./hr.talent.lms-ui.copy.shared";

const lmsForbiddenState = {
  variant: "forbidden" as const,
  title: hrLmsUiCopy.accessDenied.title,
  description: hrLmsUiCopy.accessDenied.description,
};

function HrLmsListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: Parameters<typeof GovernedPatternCListSection>[0]["listConfiguration"];
}) {
  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      forbidden={lmsForbiddenState}
      layout="embedded"
    />
  );
}

export function HrLmsHubSection({ model }: { model: HrLmsHubPageModel }) {
  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <HrLmsListSection
        title={hrLmsUiCopy.courses.surfaceHeaderTitle}
        description="Published and draft courses in the LMS catalog."
        surfaceKey={hrLmsCoursesSurfaceKey}
        listConfiguration={model.coursesList}
      />
      <HrLmsListSection
        title={hrLmsUiCopy.employeeOverview.surfaceHeaderTitle}
        description="Your enrolled courses, progress, and completion status."
        surfaceKey={hrLmsEmployeeOverviewSurfaceKey}
        listConfiguration={model.employeeOverviewList}
      />
      {model.managerOverviewList ? (
        <HrLmsListSection
          title={hrLmsUiCopy.managerOverview.surfaceHeaderTitle}
          description="Team learning status and mandatory training completion."
          surfaceKey={hrLmsManagerOverviewSurfaceKey}
          listConfiguration={model.managerOverviewList}
        />
      ) : null}
      {model.adminOverviewList ? (
        <HrLmsListSection
          title={hrLmsUiCopy.adminOverview.surfaceHeaderTitle}
          description="Organization-wide completion, overdue training, and compliance risk."
          surfaceKey={hrLmsAdminOverviewSurfaceKey}
          listConfiguration={model.adminOverviewList}
        />
      ) : null}
    </div>
  );
}

export function HrLmsReportsSection({ model }: { model: HrLmsReportsPageModel }) {
  return (
    <SectionPanel
      headingLevel={2}
      title="Learning reports"
      description={`Grouped by ${model.reportGroupBy.replaceAll("_", " ")}.`}
    >
      <HrLmsListSection
        title={hrLmsUiCopy.reports.surfaceHeaderTitle}
        description="Progress, completion, overdue, certification, and compliance training reports."
        surfaceKey={hrLmsReportsSurfaceKey}
        listConfiguration={model.reportsList}
      />
    </SectionPanel>
  );
}

export function HrLmsAuditSection({ model }: { model: HrLmsAuditPageModel }) {
  return (
    <HrLmsListSection
      title={hrLmsUiCopy.audit.surfaceHeaderTitle}
      description="Course setup, assignment, enrollment, progress, assessment, completion, and export audit events."
      surfaceKey={hrLmsAuditSurfaceKey}
      listConfiguration={model.auditList}
    />
  );
}

export function HrLmsAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrLmsUiCopy.accessDenied.title}
      description={hrLmsUiCopy.accessDenied.description}
    />
  );
}
