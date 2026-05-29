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

import { resolveGovernedDetailSectionContent } from "../metadata/detail-section.adapter";
import { GovernedAuditPanel } from "./governed-audit-panel";
import { GovernedEmpty } from "./governed-empty";

export type GovernedDetailTabsProps = {
  model: GovernedDetailTabsInput;
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

function RevisionsTable({ rows }: { rows: GovernedRevisionEntry[] }) {
  if (rows.length === 0) {
    return (
      <GovernedEmpty
        model={{ variant: "muted", title: "No revision history." }}
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

export function GovernedDetailTabs({ model }: GovernedDetailTabsProps) {
  const parsedModel = governedDetailTabsSchema.safeParse(model);
  if (!parsedModel.success) {
    return (
      <GovernedEmpty
        model={{
          variant: "muted",
          title: "Detail tabs unavailable",
          description: "The detail tab model could not be parsed.",
        }}
      />
    );
  }
  const normalizedModel = parsedModel.data;
  const kinds = visibleTabKinds(normalizedModel);
  const defaultValue = effectiveDefaultTab(normalizedModel);
  const relations = sortVisibleSections(normalizedModel.relations);
  const referrers = sortVisibleSections(normalizedModel.referrers);
  const revisions = normalizedModel.revisions ?? [];
  const auditRows = normalizedModel.audit ?? [];

  return (
    <div data-testid="governed-detail-tabs">
      <Tabs defaultValue={defaultValue} className="gap-surface-lg">
        <TabsList
          variant="line"
          className="w-full justify-start overflow-x-auto"
        >
          {kinds.includes("overview") ? (
            <TabsTrigger value="overview" data-testid="tab-overview">
              {normalizedModel.overview.label}
            </TabsTrigger>
          ) : null}
          {kinds.includes("relations") ? (
            <TabsTrigger value="relations" data-testid="tab-relations">
              Relations
            </TabsTrigger>
          ) : null}
          {kinds.includes("referrers") ? (
            <TabsTrigger value="referrers" data-testid="tab-referrers">
              Referrers
            </TabsTrigger>
          ) : null}
          {kinds.includes("revisions") ? (
            <TabsTrigger value="revisions" data-testid="tab-revisions">
              Revisions
            </TabsTrigger>
          ) : null}
          {kinds.includes("audit") ? (
            <TabsTrigger value="audit" data-testid="tab-audit">
              Audit
            </TabsTrigger>
          ) : null}
        </TabsList>

        {kinds.includes("overview") ? (
          <TabsContent value="overview" data-testid="tab-panel-overview">
            {normalizedModel.overview.hidden ? (
              <GovernedEmpty
                model={{
                  variant: "muted",
                  title: "Overview hidden",
                  description: "This overview section is marked hidden.",
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
          <TabsContent value="relations" data-testid="tab-panel-relations">
            <div className="flex flex-col gap-surface-2xl">
              {relations.map((section) => (
                <section
                  key={section.id}
                  className="flex flex-col gap-2"
                  aria-labelledby={`governed-detail-relations-${section.id}`}
                >
                  <h3
                    className="type-subtitle"
                    id={`governed-detail-relations-${section.id}`}
                  >
                    {section.label}
                  </h3>
                  {section.description ? (
                    <p className="type-muted">
                      {section.description}
                    </p>
                  ) : null}
                  {renderSectionSlot(section)}
                </section>
              ))}
            </div>
          </TabsContent>
        ) : null}

        {kinds.includes("referrers") ? (
          <TabsContent value="referrers" data-testid="tab-panel-referrers">
            <div className="flex flex-col gap-surface-2xl">
              {referrers.map((section) => (
                <section
                  key={section.id}
                  className="flex flex-col gap-2"
                  aria-labelledby={`governed-detail-referrers-${section.id}`}
                >
                  <h3
                    className="type-subtitle"
                    id={`governed-detail-referrers-${section.id}`}
                  >
                    {section.label}
                  </h3>
                  {section.description ? (
                    <p className="type-muted">
                      {section.description}
                    </p>
                  ) : null}
                  {renderSectionSlot(section)}
                </section>
              ))}
            </div>
          </TabsContent>
        ) : null}

        {kinds.includes("revisions") ? (
          <TabsContent value="revisions" data-testid="tab-panel-revisions">
            <RevisionsTable rows={revisions} />
          </TabsContent>
        ) : null}

        {kinds.includes("audit") ? (
          <TabsContent value="audit" data-testid="tab-panel-audit">
            <GovernedAuditPanel
              model={{
                dataNature: "audit-trail",
                headerTitle: `${normalizedModel.entityLabel} — audit`,
                headerDescription: `${normalizedModel.entityKind} · ${normalizedModel.entityId}`,
                rows: auditRows,
              }}
            />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
