import { Badge } from "@afenda/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@afenda/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afenda/ui/table";
import type {
  GovernedDetailTabsInput,
  GovernedDetailSection,
  GovernedDetailTabKind,
  GovernedDetailTabsModel,
  GovernedRevisionEntry,
} from "../schemas/detail-tabs.schema";
import { governedDetailTabsSchema } from "../schemas/detail-tabs.schema";

import { governedRendererCopy } from "../i18n/governed-renderer-copy.shared";
import { resolveGovernedDetailSectionContent } from "../metadata/detail-section.adapter";
import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import { GovernedHeading } from "../utils/governed-heading.shared";
import {
  governedDescriptionId,
  governedHeadingId,
  governedIdentityAttributes,
  governedTestId,
  toGovernedDomId,
} from "../utils/governed-identity.shared";
import { GovernedAuditPanel } from "./governed-audit-panel";
import { GovernedEmpty } from "./governed-empty";

export type GovernedDetailTabsProps = {
  model: GovernedDetailTabsInput;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
};

function sortVisibleSections(
  sections: GovernedDetailSection[] | undefined,
): GovernedDetailSection[] {
  if (!sections?.length) return [];
  return sections
    .filter((s) => !s.hidden)
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

function renderSectionSlot(
  section: GovernedDetailSection,
  identity?: {
    surfaceKey?: string;
    sectionKey?: string;
    componentKey?: string;
  },
) {
  return resolveGovernedDetailSectionContent(section, identity);
}

function detailSectionHeadingId(
  tabKind: "relations" | "referrers",
  sectionId: string,
): string {
  return governedHeadingId("detail-section", `${tabKind}-${sectionId}`);
}

function detailSectionDescriptionId(
  tabKind: "relations" | "referrers",
  sectionId: string,
): string {
  return governedDescriptionId("detail-section", `${tabKind}-${sectionId}`);
}

const DETAIL_TABS_COMPONENT_TYPE = "governed:detail-tabs";
const DETAIL_SECTION_COMPONENT_TYPE = "governed:detail-section";
const REVISIONS_TABLE_COMPONENT_TYPE = "governed:revisions-table";

function detailTabTestId(resolvedComponentKey: string, tab: string): string {
  return governedTestId("detail-tab", `${resolvedComponentKey}-${tab}`);
}

function detailTabPanelTestId(
  resolvedComponentKey: string,
  tab: string,
): string {
  return governedTestId("detail-tab-panel", `${resolvedComponentKey}-${tab}`);
}

function RevisionsTable({
  rows,
  surfaceKey,
  sectionKey,
  componentKey,
}: {
  rows: GovernedRevisionEntry[];
  surfaceKey?: string;
  sectionKey?: string;
  componentKey: string;
}) {
  const renderState = rows.length === 0 ? "empty" : "ready";
  const revisionsComponentKey = `${componentKey}-revisions`;

  if (rows.length === 0) {
    return (
      <div
        {...governedIdentityAttributes({
          surfaceKey,
          sectionKey,
          componentKey: revisionsComponentKey,
        })}
        {...diagnosticsDataAttributes({
          state: renderState,
          testId: governedTestId("revisions-table", revisionsComponentKey),
          componentType: REVISIONS_TABLE_COMPONENT_TYPE,
        })}
      >
        <GovernedEmpty
          model={{
            variant: "muted",
            title: governedRendererCopy.detailTabs.revisions.emptyTitle,
            emptyId: "detail-revisions-empty",
          }}
        />
      </div>
    );
  }

  const headerCellClass = "type-table-header";
  const columns = governedRendererCopy.detailTabs.revisions.columns;

  return (
    <div
      className="rounded-section border"
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey: revisionsComponentKey,
      })}
      {...diagnosticsDataAttributes({
        state: renderState,
        testId: governedTestId("revisions-table", revisionsComponentKey),
        componentType: REVISIONS_TABLE_COMPONENT_TYPE,
      })}
    >
      {/* audit-ds: ignore no-arbitrary-value — table minimum scroll width */}
      <Table className="min-w-[560px] text-left type-control">
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className={headerCellClass}>{columns.when}</TableHead>
            <TableHead className={headerCellClass}>{columns.verb}</TableHead>
            <TableHead className={headerCellClass}>{columns.actor}</TableHead>
            <TableHead className={headerCellClass}>{columns.narrative}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="type-mono-cell whitespace-nowrap">
                {row.occurredAt}
              </TableCell>
              <TableCell className="type-mono-cell uppercase">
                {row.verb}
              </TableCell>
              {/* audit-ds: ignore no-arbitrary-value — revision actor column max-width */}
              <TableCell className="max-w-[180px] truncate">
                {row.actorLabel}
              </TableCell>
              {/* audit-ds: ignore no-arbitrary-value — revision narrative column max-width */}
              <TableCell className="max-w-[480px] type-muted">
                {row.narrative}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function visibleTabKinds(
  model: GovernedDetailTabsModel,
): GovernedDetailTabKind[] {
  const kinds: GovernedDetailTabKind[] = ["overview"];
  if (sortVisibleSections(model.relations).length > 0) {
    kinds.push("relations");
  }
  if (sortVisibleSections(model.referrers).length > 0) {
    kinds.push("referrers");
  }
  if ((model.revisions?.length ?? 0) > 0) {
    kinds.push("revisions");
  }
  if ((model.audit?.length ?? 0) > 0) {
    kinds.push("audit");
  }
  return kinds;
}

function effectiveDefaultTab(
  model: GovernedDetailTabsModel,
): GovernedDetailTabKind {
  const kinds = visibleTabKinds(model);
  if (kinds.includes(model.defaultTab)) {
    return model.defaultTab;
  }
  return "overview";
}

function summarizeDetailTabs(model: GovernedDetailTabsModel) {
  return {
    relations: sortVisibleSections(model.relations).length,
    referrers: sortVisibleSections(model.referrers).length,
    revisions: model.revisions?.length ?? 0,
    audit: model.audit?.length ?? 0,
  };
}

function DetailTabSection({
  tabKind,
  section,
  surfaceKey,
  sectionKey,
  resolvedComponentKey,
}: {
  tabKind: "relations" | "referrers";
  section: GovernedDetailSection;
  surfaceKey?: string;
  sectionKey?: string;
  resolvedComponentKey: string;
}) {
  const headingId = detailSectionHeadingId(tabKind, section.id);
  const descriptionId = detailSectionDescriptionId(tabKind, section.id);
  const sectionComponentKey = `${tabKind}-${section.id}`;
  const scopedSectionKey = `${resolvedComponentKey}-${sectionComponentKey}`;

  return (
    <section
      className="flex flex-col gap-2"
      aria-labelledby={headingId}
      {...(section.description ? { "aria-describedby": descriptionId } : {})}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey: sectionKey ?? scopedSectionKey,
        componentKey: scopedSectionKey,
      })}
      {...diagnosticsDataAttributes({
        state: "ready",
        testId: governedTestId("detail-section", scopedSectionKey),
        componentType: DETAIL_SECTION_COMPONENT_TYPE,
      })}
    >
      <GovernedHeading level={3} variant="card" id={headingId}>
        {section.label}
      </GovernedHeading>
      {section.description ? (
        <p className="type-muted" id={descriptionId}>
          {section.description}
        </p>
      ) : null}
      {renderSectionSlot(section, {
        surfaceKey,
        sectionKey: sectionKey ?? scopedSectionKey,
        componentKey: scopedSectionKey,
      })}
    </section>
  );
}

export function GovernedDetailTabs({
  model,
  surfaceKey,
  sectionKey,
  componentKey,
}: GovernedDetailTabsProps) {
  const parsedModel = governedDetailTabsSchema.safeParse(model);
  const resolvedComponentKey =
    componentKey ??
    sectionKey ??
    surfaceKey ??
    (parsedModel.success ? parsedModel.data.entityId : undefined) ??
    "detail-tabs";
  const panelId = toGovernedDomId("governed-detail-tabs", resolvedComponentKey);
  const tabLabels = governedRendererCopy.detailTabs.tabLabels;

  if (!parsedModel.success) {
    return (
      <section
        id={panelId}
        {...governedIdentityAttributes({
          surfaceKey,
          sectionKey,
          componentKey: resolvedComponentKey,
        })}
        {...diagnosticsDataAttributes({
          state: "invalid",
          testId: governedTestId("detail-tabs", resolvedComponentKey),
          componentType: DETAIL_TABS_COMPONENT_TYPE,
        })}
      >
        <GovernedEmpty
          model={{
            variant: "error",
            title: governedRendererCopy.parseError.detailTabs.userTitle,
            description:
              governedRendererCopy.parseError.detailTabs.userDescription,
            emptyId: "detail-tabs-invalid",
          }}
        />
      </section>
    );
  }

  const normalizedModel = parsedModel.data;
  const kinds = visibleTabKinds(normalizedModel);
  const defaultValue = effectiveDefaultTab(normalizedModel);
  const relations = sortVisibleSections(normalizedModel.relations);
  const referrers = sortVisibleSections(normalizedModel.referrers);
  const revisions = normalizedModel.revisions ?? [];
  const auditRows = normalizedModel.audit ?? [];
  const auditComponentKey = `${resolvedComponentKey}-audit`;
  const summary = summarizeDetailTabs(normalizedModel);

  return (
    <section
      id={panelId}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey: resolvedComponentKey,
      })}
      {...diagnosticsDataAttributes({
        state: "ready",
        testId: governedTestId("detail-tabs", resolvedComponentKey),
        componentType: DETAIL_TABS_COMPONENT_TYPE,
      })}
    >
      <Tabs defaultValue={defaultValue} className="gap-surface-lg">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <GovernedHeading level={3} variant="card">
                {normalizedModel.entityLabel}
              </GovernedHeading>
              <p className="type-muted">
                {normalizedModel.entityKind} · {normalizedModel.entityId}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline">{kinds.length} tabs</Badge>
              {summary.relations > 0 ? (
                <Badge variant="secondary">{summary.relations} relations</Badge>
              ) : null}
              {summary.referrers > 0 ? (
                <Badge variant="secondary">{summary.referrers} referrers</Badge>
              ) : null}
              {summary.revisions > 0 ? (
                <Badge variant="info">{summary.revisions} revisions</Badge>
              ) : null}
              {summary.audit > 0 ? (
                <Badge variant="warning">{summary.audit} audit events</Badge>
              ) : null}
            </div>
          </div>
        </div>

        <TabsList
          variant="line"
          className="w-full justify-start overflow-x-auto"
        >
          {kinds.includes("overview") ? (
            <TabsTrigger
              value="overview"
              data-testid={detailTabTestId(resolvedComponentKey, "overview")}
            >
              {normalizedModel.overview.label}
            </TabsTrigger>
          ) : null}
          {kinds.includes("relations") ? (
            <TabsTrigger
              value="relations"
              data-testid={detailTabTestId(resolvedComponentKey, "relations")}
            >
              {tabLabels.relations}
            </TabsTrigger>
          ) : null}
          {kinds.includes("referrers") ? (
            <TabsTrigger
              value="referrers"
              data-testid={detailTabTestId(resolvedComponentKey, "referrers")}
            >
              {tabLabels.referrers}
            </TabsTrigger>
          ) : null}
          {kinds.includes("revisions") ? (
            <TabsTrigger
              value="revisions"
              data-testid={detailTabTestId(resolvedComponentKey, "revisions")}
            >
              {tabLabels.revisions}
            </TabsTrigger>
          ) : null}
          {kinds.includes("audit") ? (
            <TabsTrigger
              value="audit"
              data-testid={detailTabTestId(resolvedComponentKey, "audit")}
            >
              {tabLabels.audit}
            </TabsTrigger>
          ) : null}
        </TabsList>

        {kinds.includes("overview") ? (
          <TabsContent
            value="overview"
            data-testid={detailTabPanelTestId(resolvedComponentKey, "overview")}
          >
            <section
              className="flex flex-col gap-surface-lg"
              {...governedIdentityAttributes({
                surfaceKey,
                sectionKey,
                componentKey: `${resolvedComponentKey}-overview`,
              })}
              {...diagnosticsDataAttributes({
                state: normalizedModel.overview.hidden ? "empty" : "ready",
                testId: detailTabPanelTestId(resolvedComponentKey, "overview"),
                componentType: DETAIL_SECTION_COMPONENT_TYPE,
              })}
            >
              {normalizedModel.overview.hidden ? (
                <GovernedEmpty
                  model={{
                    variant: "muted",
                    title: governedRendererCopy.detailTabs.overviewHidden.title,
                    description:
                      governedRendererCopy.detailTabs.overviewHidden.description,
                    emptyId: "detail-overview-hidden",
                  }}
                />
              ) : (
                <>
                  {normalizedModel.overview.description ? (
                    <p className="type-muted">
                      {normalizedModel.overview.description}
                    </p>
                  ) : null}
                  {renderSectionSlot(normalizedModel.overview, {
                    surfaceKey,
                    sectionKey,
                    componentKey: `${resolvedComponentKey}-overview`,
                  })}
                </>
              )}
            </section>
          </TabsContent>
        ) : null}

        {kinds.includes("relations") ? (
          <TabsContent
            value="relations"
            data-testid={detailTabPanelTestId(resolvedComponentKey, "relations")}
          >
            <div className="flex flex-col gap-surface-2xl">
              {relations.map((section) => (
                <DetailTabSection
                  key={section.id}
                  tabKind="relations"
                  section={section}
                  surfaceKey={surfaceKey}
                  sectionKey={sectionKey}
                  resolvedComponentKey={resolvedComponentKey}
                />
              ))}
            </div>
          </TabsContent>
        ) : null}

        {kinds.includes("referrers") ? (
          <TabsContent
            value="referrers"
            data-testid={detailTabPanelTestId(resolvedComponentKey, "referrers")}
          >
            <div className="flex flex-col gap-surface-2xl">
              {referrers.map((section) => (
                <DetailTabSection
                  key={section.id}
                  tabKind="referrers"
                  section={section}
                  surfaceKey={surfaceKey}
                  sectionKey={sectionKey}
                  resolvedComponentKey={resolvedComponentKey}
                />
              ))}
            </div>
          </TabsContent>
        ) : null}

        {kinds.includes("revisions") ? (
          <TabsContent
            value="revisions"
            data-testid={detailTabPanelTestId(resolvedComponentKey, "revisions")}
          >
            <RevisionsTable
              rows={revisions}
              surfaceKey={surfaceKey}
              sectionKey={sectionKey}
              componentKey={resolvedComponentKey}
            />
          </TabsContent>
        ) : null}

        {kinds.includes("audit") ? (
          <TabsContent
            value="audit"
            data-testid={detailTabPanelTestId(resolvedComponentKey, "audit")}
          >
            <GovernedAuditPanel
              model={{
                dataNature: "audit-trail",
                headerTitle: `${normalizedModel.entityLabel} — audit`,
                headerDescription: `${normalizedModel.entityKind} · ${normalizedModel.entityId}`,
                rows: auditRows,
              }}
              surfaceKey={surfaceKey}
              sectionKey={sectionKey}
              componentKey={auditComponentKey}
            />
          </TabsContent>
        ) : null}
      </Tabs>
    </section>
  );
}
