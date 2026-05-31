import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";

import { hrSbsRoutePaths } from "../contracts/hr.payroll.sbs-route.contract";
import type {
  HrSbsAuditPageModel,
  HrSbsHubPageModel,
  HrSbsReportsPageModel,
} from "../data/hr.payroll.sbs.page-model.server";
import {
  hrSbsAuditSurfaceKey,
  hrSbsMappingsSurfaceKey,
  hrSbsVersionsSurfaceKey,
} from "../data/hr.payroll.sbs-search-params.parse.shared";
import { hrSbsUiCopy } from "../surface/hr.payroll.sbs-ui.copy.shared";

const sbsForbiddenState = {
  variant: "forbidden" as const,
  title: hrSbsUiCopy.accessDenied.title,
  description: hrSbsUiCopy.accessDenied.description,
};

function HrSbsListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: HrSbsHubPageModel["versionsList"];
}) {
  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      forbidden={sbsForbiddenState}
      layout="embedded"
    />
  );
}

export function HrSbsAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrSbsUiCopy.accessDenied.title}
      description={hrSbsUiCopy.accessDenied.description}
    />
  );
}

function HrSbsSectionNav({ active }: { active: "hub" | "reports" | "audit" }) {
  const links = [
    { key: "hub" as const, href: hrSbsRoutePaths.hub, label: "Benchmarks" },
    { key: "reports" as const, href: hrSbsRoutePaths.reports, label: "Reports" },
    { key: "audit" as const, href: hrSbsRoutePaths.audit, label: "Audit" },
  ];

  return (
    <nav className="@container flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.key}
          href={link.href}
          className={
            active === link.key
              ? "rounded-control bg-primary px-3 py-1.5 type-control text-primary-foreground"
              : "rounded-control border px-3 py-1.5 type-muted"
          }
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function HrSbsHubSection({ pageModel }: { pageModel: HrSbsHubPageModel }) {
  const copy = hrSbsUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />
      <HrSbsSectionNav active="hub" />
      <HrSbsListSection
        title={copy.versions.surfaceHeaderTitle}
        description="Survey benchmark versions by provider, year, and effective date (HRM-SBS-001..004, 022)."
        surfaceKey={hrSbsVersionsSurfaceKey}
        listConfiguration={pageModel.versionsList}
      />
      <HrSbsListSection
        title={copy.mappings.surfaceHeaderTitle}
        description="Internal job and grade mappings with approval workflow (HRM-SBS-005..008)."
        surfaceKey={hrSbsMappingsSurfaceKey}
        listConfiguration={pageModel.mappingsList}
      />
    </div>
  );
}

export function HrSbsReportsSection({
  pageModel,
}: {
  pageModel: HrSbsReportsPageModel;
}) {
  const copy = hrSbsUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel headingLevel={1} title="Benchmarking reports" description={copy.page.description} />
      <HrSbsSectionNav active="reports" />
      <HrSbsListSection
        title={copy.reports.surfaceHeaderTitle}
        description="Market competitiveness by employee and market position (HRM-SBS-026)."
        surfaceKey={pageModel.surfaceKeys.benchmarkReport}
        listConfiguration={pageModel.benchmarkReportList}
      />
      <HrSbsListSection
        title={copy.reports.payEquityHeaderTitle}
        description="Pay equity cohorts by dimension (HRM-SBS-027)."
        surfaceKey={pageModel.surfaceKeys.payEquityReport}
        listConfiguration={pageModel.payEquityReportList}
      />
    </div>
  );
}

export function HrSbsAuditSection({ pageModel }: { pageModel: HrSbsAuditPageModel }) {
  const copy = hrSbsUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel headingLevel={1} title="Audit trail" description={copy.page.description} />
      <HrSbsSectionNav active="audit" />
      <HrSbsListSection
        title={copy.audit.surfaceHeaderTitle}
        description="Survey uploads, mappings, analyses, recommendations, and approvals (HRM-SBS-028)."
        surfaceKey={hrSbsAuditSurfaceKey}
        listConfiguration={pageModel.auditList}
      />
    </div>
  );
}
