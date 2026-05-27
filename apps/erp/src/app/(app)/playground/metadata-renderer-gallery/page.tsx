/**
 * Metadata renderer gallery — dev-only fixture matrix.
 *
 * Renders representative fixtures for every governed surface type so
 * the team can verify visual output and skeleton parity without a live
 * database connection.
 *
 * Route: /playground/metadata-renderer-gallery
 */
import {
  buildAuditPanelModel,
  buildDashboardHardeningChart,
  buildDashboardKpiStatGrid,
  buildDocumentRegistryListSurface,
  buildModuleRecordListSurface,
  buildModuleWorkItemKanbanSurface,
  buildModuleWorkItemListSurface,
  buildModuleWorkspaceCountStatGrid,
  buildOperationalSkillsListSurface,
  buildRecordDetailTabs,
  buildRecoveryPlaybookListSurface,
  buildSavedViewsListSurface,
  dashboardHardeningChartSurfaceKey,
} from "@afenda/domain";
import {
  GovernedKanbanFooterSection,
  GovernedKanbanReadOnlyBoard,
  GovernedPatternBChartSection,
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Metadata Renderer Gallery",
  robots: { index: false },
};

// ─── Gallery fixtures ─────────────────────────────────────────────────────────

const GALLERY_RECORD = {
  id: "gallery-record-001",
  reference: "GAL-001",
  title: "Gallery fixture record",
  recordType: "close-control" as const,
  status: "active" as const,
  owner: "Gallery User",
  amount: "MYR 5,000",
  amountValue: 5000,
  currency: "MYR",
  due: "30 Jun 2026",
  dueAt: "2026-06-30T00:00:00.000Z",
  metadataSummary: "test: gallery",
  extensionValid: true,
  extensionIssues: [] as string[],
};

const GALLERY_RECORD_BLOCKED = {
  ...GALLERY_RECORD,
  id: "gallery-record-002",
  reference: "GAL-002",
  title: "Blocked fixture record",
  status: "blocked" as const,
  extensionValid: false,
  extensionIssues: ["risk: Unresolved gap"],
};

const GALLERY_WORK_ITEM = {
  id: "gallery-work-001",
  subject: "Approve Q2 budget revision",
  owner: "Finance Director",
  status: "pending" as const,
  priority: "high" as const,
  due: "30 Jun 2026",
  dueAt: "2026-06-30T00:00:00.000Z",
};

const GALLERY_WORK_ITEM_ESCALATED = {
  id: "gallery-work-002",
  subject: "Escalated vendor dispute",
  owner: "Procurement Lead",
  status: "escalated" as const,
  priority: "high" as const,
  due: "15 Jun 2026",
  dueAt: "2026-06-15T00:00:00.000Z",
};

const GALLERY_DOCUMENT = {
  id: "gallery-doc-001",
  title: "Supplier invoice Q2",
  contentType: "PDF",
  size: "121 KB",
  access: "internal",
};

const GALLERY_VIEW = {
  id: "gallery-view-001",
  name: "High priority items",
  description: "Filtered to high priority work items only.",
  visibility: "private",
};

const GALLERY_PLAYBOOK = {
  id: "gallery-playbook-001",
  label: "Debtor escalation protocol",
  problem: "Overdue accounts exceeding 90 days.",
  diagnosis: "Collections threshold not triggered.",
  action: "Escalate to collections team with supporting evidence.",
  risk: "high",
};

const GALLERY_SKILL = {
  id: "gallery-skill-001",
  label: "Reconciliation assistant",
  moduleId: "finance",
  description: "AI-assisted reconciliation for month-end close.",
  approvalPolicy: "human-required",
};

const GALLERY_HARDENING_CHECKLIST = [
  { area: "auth", label: "Auth configured", status: "done" },
  { area: "cron", label: "CRON secret set", status: "done" },
  { area: "ai", label: "AI gateway wired", status: "done" },
  { area: "observability", label: "Observability drain", status: "review" },
  { area: "capabilities", label: "Capability matrix", status: "review" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MetadataRendererGalleryPage() {
  const recordListSurface = buildModuleRecordListSurface({
    moduleId: "finance",
    records: [GALLERY_RECORD, GALLERY_RECORD_BLOCKED],
  });
  const emptyRecordListSurface = buildModuleRecordListSurface({
    moduleId: "finance",
    records: [],
  });
  const workItemListSurface = buildModuleWorkItemListSurface({
    moduleId: "approvals",
    workItems: [GALLERY_WORK_ITEM, GALLERY_WORK_ITEM_ESCALATED],
  });
  const documentListSurface = buildDocumentRegistryListSurface({
    moduleId: "finance",
    documents: [GALLERY_DOCUMENT],
  });
  const savedViewsListSurface = buildSavedViewsListSurface({
    views: [GALLERY_VIEW],
    moduleId: "finance",
  });
  const playbookListSurface = buildRecoveryPlaybookListSurface({
    playbooks: [GALLERY_PLAYBOOK],
  });
  const skillsListSurface = buildOperationalSkillsListSurface({
    skills: [GALLERY_SKILL],
  });
  const workItemKanbanSurface = buildModuleWorkItemKanbanSurface({
    moduleId: "approvals",
    workItems: [GALLERY_WORK_ITEM, GALLERY_WORK_ITEM_ESCALATED],
  });
  const workspaceCountStats = buildModuleWorkspaceCountStatGrid({
    moduleId: "finance",
    recordCount: 142,
    workItemCount: 7,
    documentCount: 23,
    highPriorityWorkItemCount: 3,
  });
  const kpiStatGrid = buildDashboardKpiStatGrid({
    metrics: [
      {
        label: "Revenue (MYR)",
        value: "4,820,000",
        detail: "YTD recognised revenue.",
        tone: "positive",
      },
      {
        label: "Overdue items",
        value: "12",
        detail: "Work items past due date.",
        tone: "warning",
      },
      {
        label: "Pending approvals",
        value: "5",
        detail: "Awaiting director sign-off.",
        tone: "neutral",
      },
    ],
  });
  const hardeningChart = buildDashboardHardeningChart({
    checklist: GALLERY_HARDENING_CHECKLIST,
  });
  const auditPanel = buildAuditPanelModel({
    title: "Record audit trail",
    resourceLabel: GALLERY_RECORD.reference,
    auditLogs: [],
  });
  const detailTabs = buildRecordDetailTabs({
    moduleId: "finance",
    record: {
      ...GALLERY_RECORD,
      moduleId: "finance",
      updatedAt: "27 May 2026",
      metadata: { risk: "low", region: "MY" },
      auditPanel,
    },
  });

  return (
    <div className="space-y-10 pb-16">
      <div className="border-b border-line pb-4">
        <h1 className="text-2xl font-semibold text-foreground">
          Metadata Renderer Gallery
        </h1>
        <p className="mt-1 text-sm text-muted">
          Dev-only fixture matrix for all governed surface types. Not indexed.
        </p>
      </div>

      {/* ── Pattern C: record list ─────────────────────────────────────── */}
      <GallerySection label="Pattern C — Record list (ready)">
        <GovernedPatternCListSection
          title="Finance records"
          surfaceKey="gallery.finance.records"
          listConfiguration={recordListSurface}
          parentAccessAllowed
          layout="embedded"
          trailingColumn={{
            header: "Action",
            cellId: "governed.metadata",
            context: { surfaceKey: "gallery.finance.records", moduleId: "finance" },
          }}
        />
      </GallerySection>

      <GallerySection label="Pattern C — Record list (empty state)">
        <GovernedPatternCListSection
          title="Finance records"
          surfaceKey="gallery.finance.records.empty"
          listConfiguration={emptyRecordListSurface}
          parentAccessAllowed
          layout="embedded"
        />
      </GallerySection>

      <GallerySection label="Pattern C — Work-item list">
        <GovernedPatternCListSection
          title="Work queue"
          surfaceKey="gallery.approvals.work-items"
          listConfiguration={workItemListSurface}
          parentAccessAllowed
          layout="embedded"
        />
      </GallerySection>

      <GallerySection label="Pattern C — Document registry">
        <GovernedPatternCListSection
          title="Documents"
          surfaceKey="gallery.finance.documents"
          listConfiguration={documentListSurface}
          parentAccessAllowed
          layout="embedded"
        />
      </GallerySection>

      <GallerySection label="Pattern C — Saved views">
        <GovernedPatternCListSection
          title="Saved views"
          surfaceKey="gallery.finance.saved-views"
          listConfiguration={savedViewsListSurface}
          parentAccessAllowed
          layout="embedded"
        />
      </GallerySection>

      <GallerySection label="Pattern C — Recovery playbooks">
        <GovernedPatternCListSection
          title="Playbooks"
          surfaceKey="gallery.solution-console.playbooks"
          listConfiguration={playbookListSurface}
          parentAccessAllowed
          layout="embedded"
        />
      </GallerySection>

      <GallerySection label="Pattern C — Operational skills">
        <GovernedPatternCListSection
          title="Skills"
          surfaceKey="gallery.solution-console.skills"
          listConfiguration={skillsListSurface}
          parentAccessAllowed
          layout="embedded"
        />
      </GallerySection>

      {/* ── Pattern B: stat sections ───────────────────────────────────── */}
      <GallerySection label="Pattern B — Workspace count stats">
        <GovernedPatternBStatSection
          title="Workspace counts"
          surfaceKey="gallery.finance.counts"
          layout="embedded"
          statGroups={[{ groupKey: "counts", configuration: workspaceCountStats }]}
        />
      </GallerySection>

      <GallerySection label="Pattern B — KPI stat grid">
        <GovernedPatternBStatSection
          title="Module KPIs"
          surfaceKey="gallery.finance.kpis"
          layout="embedded"
          statGroups={[{ groupKey: "kpis", configuration: kpiStatGrid }]}
        />
      </GallerySection>

      {/* ── Pattern B: chart section ───────────────────────────────────── */}
      <GallerySection label="Pattern B — Chart (categorical bar)">
        <GovernedPatternBChartSection
          title="Hardening status"
          surfaceKey={dashboardHardeningChartSurfaceKey}
          chartConfiguration={hardeningChart}
          layout="embedded"
        />
      </GallerySection>

      {/* ── Kanban board ───────────────────────────────────────────────── */}
      <GallerySection label="Kanban — Work-item board (read-only)">
        <GovernedKanbanFooterSection
          surfaceKey="gallery.approvals.kanban"
          title="Work queue board"
          description="Workflow items by current stage."
          layout="titled"
        >
          <GovernedKanbanReadOnlyBoard
            configuration={workItemKanbanSurface}
            surfaceKey="gallery.approvals.kanban"
          />
        </GovernedKanbanFooterSection>
      </GallerySection>

      {/* ── Detail tabs ─────────────────────────────────────────────────── */}
      <GallerySection label="Detail tabs — Record detail">
        <pre className="overflow-auto rounded-lg border border-line bg-surface-strong p-4 text-xs text-muted">
          {JSON.stringify(detailTabs, null, 2)}
        </pre>
      </GallerySection>
    </div>
  );
}

function GallerySection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="rounded bg-surface-strong px-2 py-0.5 font-mono text-xs text-muted">
          {label}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>
      {children}
    </section>
  );
}
