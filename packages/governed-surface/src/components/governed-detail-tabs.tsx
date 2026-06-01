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

function renderSectionSlot(section: GovernedDetailSection) {
  return resolveGovernedDetailSectionContent(section);
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

function RevisionsTable({ rows }: { rows: GovernedRevisionEntry[] }) {
  if (rows.length === 0) {
    return (
      <GovernedEmpty
        model={{
          variant: "muted",
          title: "No revision history.",
          emptyId: "detail-revisions-empty",
        }}
      />
    );
  }

  const headerCellClass = "type-table-header";

  return (
    <div className="rounded-section border">
      {/* audit-ds: ignore no-arbitrary-value — table minimum scroll width */}
      <Table className="min-w-[560px] text-left type-control">
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className={headerCellClass}>When</TableHead>
            <TableHead className={headerCellClass}>Verb</TableHead>
            <TableHead className={headerCellClass}>Actor</TableHead>
            <TableHead className={headerCellClass}>Narrative</TableHead>
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

function DetailTabSection({
  tabKind,
  section,
  surfaceKey,
}: {
  tabKind: "relations" | "referrers";
  section: GovernedDetailSection;
  surfaceKey?: string;
}) {
  const headingId = detailSectionHeadingId(tabKind, section.id);
  const descriptionId = detailSectionDescriptionId(tabKind, section.id);
  const sectionComponentKey = `${tabKind}-${section.id}`;

  return (
    <section
      className="flex flex-col gap-2"
      aria-labelledby={headingId}
      {...(section.description ? { "aria-describedby": descriptionId } : {})}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey: sectionComponentKey,
        componentKey: sectionComponentKey,
      })}
      {...diagnosticsDataAttributes({
        state: "ready",
        testId: governedTestId("detail-section", sectionComponentKey),
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
      {renderSectionSlot(section)}
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
    surfaceKey ??
    (parsedModel.success ? parsedModel.data.entityId : "detail-tabs");
  const panelId = toGovernedDomId("governed-detail-tabs", resolvedComponentKey);

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
      })}
    >
      <Tabs defaultValue={defaultValue} className="gap-surface-lg">
        <TabsList
          variant="line"
          className="w-full justify-start overflow-x-auto"
        >
          {kinds.includes("overview") ? (
            <TabsTrigger
              value="overview"
              data-testid={governedTestId("detail-tab", "overview")}
            >
              {normalizedModel.overview.label}
            </TabsTrigger>
          ) : null}
          {kinds.includes("relations") ? (
            <TabsTrigger
              value="relations"
              data-testid={governedTestId("detail-tab", "relations")}
            >
              Relations
            </TabsTrigger>
          ) : null}
          {kinds.includes("referrers") ? (
            <TabsTrigger
              value="referrers"
              data-testid={governedTestId("detail-tab", "referrers")}
            >
              Referrers
            </TabsTrigger>
          ) : null}
          {kinds.includes("revisions") ? (
            <TabsTrigger
              value="revisions"
              data-testid={governedTestId("detail-tab", "revisions")}
            >
              Revisions
            </TabsTrigger>
          ) : null}
          {kinds.includes("audit") ? (
            <TabsTrigger
              value="audit"
              data-testid={governedTestId("detail-tab", "audit")}
            >
              Audit
            </TabsTrigger>
          ) : null}
        </TabsList>

        {kinds.includes("overview") ? (
          <TabsContent
            value="overview"
            data-testid={governedTestId("detail-tab-panel", "overview")}
          >
            {normalizedModel.overview.hidden ? (
              <GovernedEmpty
                model={{
                  variant: "muted",
                  title: "Overview hidden",
                  description: "This overview section is marked hidden.",
                  emptyId: "detail-overview-hidden",
                }}
              />
            ) : (
              <div className="flex flex-col gap-surface-lg">
                {normalizedModel.overview.description ? (
                  <p className="type-muted">
                    {normalizedModel.overview.description}
                  </p>
                ) : null}
                {renderSectionSlot(normalizedModel.overview)}
              </div>
            )}
          </TabsContent>
        ) : null}

        {kinds.includes("relations") ? (
          <TabsContent
            value="relations"
            data-testid={governedTestId("detail-tab-panel", "relations")}
          >
            <div className="flex flex-col gap-surface-2xl">
              {relations.map((section) => (
                <DetailTabSection
                  key={section.id}
                  tabKind="relations"
                  section={section}
                  surfaceKey={surfaceKey}
                />
              ))}
            </div>
          </TabsContent>
        ) : null}

        {kinds.includes("referrers") ? (
          <TabsContent
            value="referrers"
            data-testid={governedTestId("detail-tab-panel", "referrers")}
          >
            <div className="flex flex-col gap-surface-2xl">
              {referrers.map((section) => (
                <DetailTabSection
                  key={section.id}
                  tabKind="referrers"
                  section={section}
                  surfaceKey={surfaceKey}
                />
              ))}
            </div>
          </TabsContent>
        ) : null}

        {kinds.includes("revisions") ? (
          <TabsContent
            value="revisions"
            data-testid={governedTestId("detail-tab-panel", "revisions")}
          >
            <RevisionsTable rows={revisions} />
          </TabsContent>
        ) : null}

        {kinds.includes("audit") ? (
          <TabsContent
            value="audit"
            data-testid={governedTestId("detail-tab-panel", "audit")}
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
