import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type {
  HrMcpAuditPageModel,
  HrMcpCountryDetailPageModel,
  HrMcpCrossCountryReportsPageModel,
  HrMcpHubPageModel,
} from "../data/hr.payroll.mcp.page-model.server";
import {
  hrMcpAuditTrailSurfaceKey,
  hrMcpCountryConfigsSurfaceKey,
  hrMcpCrossCountryCostSurfaceKey,
  hrMcpRuleVersionsSurfaceKey,
} from "../data/hr.payroll.mcp-search-params.parse.shared";
import { hrMcpUiCopy } from "../surface/hr.payroll.mcp-ui.copy.shared";

const mcpForbiddenState = {
  variant: "forbidden" as const,
  title: hrMcpUiCopy.accessDenied.title,
  description: hrMcpUiCopy.accessDenied.description,
};

function HrMcpListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: HrMcpHubPageModel["countryConfigsList"];
}) {
  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      forbidden={mcpForbiddenState}
      layout="embedded"
    />
  );
}

export function HrMcpAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrMcpUiCopy.accessDenied.title}
      description={hrMcpUiCopy.accessDenied.description}
    />
  );
}

export function HrMcpStatutoryAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrMcpUiCopy.statutoryAccessDenied.title}
      description={hrMcpUiCopy.statutoryAccessDenied.description}
    />
  );
}

export function HrMcpHubSection({ pageModel }: { pageModel: HrMcpHubPageModel }) {
  const copy = hrMcpUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />
      <HrMcpListSection
        title={copy.countryConfigs.surfaceHeaderTitle}
        description="Country payroll configuration by legal entity, currency, and statutory settings (HRM-MCP-001..014)."
        surfaceKey={hrMcpCountryConfigsSurfaceKey}
        listConfiguration={pageModel.countryConfigsList}
      />
    </div>
  );
}

export function HrMcpCountryDetailSection({
  pageModel,
}: {
  pageModel: HrMcpCountryDetailPageModel;
}) {
  const copy = hrMcpUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title="Country rule versions"
        description="Draft, publish, and snapshot country payroll rule versions (HRM-MCP-023..024)."
      />
      <HrMcpListSection
        title={copy.ruleVersions.surfaceHeaderTitle}
        description="Published rule versions are locked and preserved on finalized payroll runs."
        surfaceKey={hrMcpRuleVersionsSurfaceKey}
        listConfiguration={pageModel.ruleVersionsList}
      />
    </div>
  );
}

export function HrMcpCrossCountryReportsSection({
  pageModel,
}: {
  pageModel: HrMcpCrossCountryReportsPageModel;
}) {
  const copy = hrMcpUiCopy.crossCountryCost;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title="Cross-country payroll reporting"
        description={`Consolidated employer cost for period ${pageModel.periodRef} (HRM-MCP-026..027).`}
      />
      <HrMcpListSection
        title={copy.surfaceHeaderTitle}
        description="Employer payroll cost by country, legal entity, currency, pay group, and period."
        surfaceKey={hrMcpCrossCountryCostSurfaceKey}
        listConfiguration={pageModel.crossCountryCostList}
      />
    </div>
  );
}

export function HrMcpAuditSection({ pageModel }: { pageModel: HrMcpAuditPageModel }) {
  const copy = hrMcpUiCopy.auditTrail;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title="Country payroll audit trail"
        description="Setup changes, rule updates, statutory calculations, filing exports, and localization (HRM-MCP-028)."
      />
      <HrMcpListSection
        title={copy.surfaceHeaderTitle}
        description="Every country payroll configuration change and filing export creates an audit event."
        surfaceKey={hrMcpAuditTrailSurfaceKey}
        listConfiguration={pageModel.auditList}
      />
    </div>
  );
}
