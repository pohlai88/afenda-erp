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
  buildDocumentActivityLinesListSurface,
  buildDocumentRegistryListSurface,
  buildModuleRecordListSurface,
  buildModuleWorkItemKanbanSurface,
  buildModuleWorkItemListSurface,
  buildModuleWorkspaceCountStatGrid,
  buildRecordDetailTabs,
  buildSavedViewsListSurface,
  dashboardHardeningChartSurfaceKey,
} from "@afenda/kernel";
import {
  GOVERNED_METADATA_SCHEMA_VERSION,
  buildGovernedStatGrid,
} from "@afenda/governed-surface";
import { GovernedComponentRenderer } from "@afenda/governed-surface/metadata";
import {
  buildLynxOperationalSkillsListSurface,
  buildLynxRecoveryPlaybookListSurface,
} from "@afenda/feature-lynx/metadata";
import {
  buildApprovalsListSurface,
  buildMembersListSurface,
  buildSystemAdminApprovalQueueListSurface,
  buildSystemAdminAuditViewerListSurface,
  buildUsersListSurface,
  systemAdminApprovalDetailDeprecatedGalleryFixture,
  systemAdminApprovalDetailGalleryFixture,
  systemAdminApprovalsGalleryRows,
  systemAdminApprovalsQueueGalleryRows,
  systemAdminApprovalsSurfaceKey,
  systemAdminApprovalsQueueSurfaceKey,
  systemAdminApprovalsUiCopy,
  systemAdminAuditCoverageGalleryGaps,
  systemAdminAuditDetailGalleryFixture,
  systemAdminAuditViewerGalleryRows,
  systemAdminAuditViewerSurfaceKey,
  systemAdminAuditUiCopy,
  systemAdminDocumentActivityGalleryEvents,
  systemAdminDocumentActivityGallerySurfaceKey,
  systemAdminDocumentActivityHrGalleryEvents,
  systemAdminDocumentActivityHrGallerySurfaceKey,
  systemAdminDocumentQuarantineInboxGalleryRows,
  systemAdminDocumentQuarantineInboxSurfaceKey,
  systemAdminDocumentRegistryGalleryModuleId,
  systemAdminDocumentRegistryGalleryRows,
  systemAdminDocumentRegistryGallerySurfaceKey,
  systemAdminDocumentRegistrySensitiveGalleryModuleId,
  buildSystemAdminDocumentQuarantineInboxListSurface,
  systemAdminMembersSurfaceKey,
  systemAdminMembershipsGalleryRows,
  systemAdminUsersGalleryRows,
  systemAdminUsersSurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import {
  SystemAdminApprovalQueueTrailingCell,
  SystemAdminApprovalTrailingCell,
  SystemAdminDocumentQuarantineTrailingCell,
  SystemAdminDocumentRegistryTrailingCell,
  SystemAdminMembershipTrailingCell,
} from "@afenda/feature-system-admin/client";
import {
  SystemAdminApprovalDetailPanel,
  SystemAdminAuditCoveragePanel,
  SystemAdminAuditDetailPanel,
} from "@afenda/feature-system-admin/server";
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

const GALLERY_DOCUMENT = systemAdminDocumentRegistryGalleryRows[0]!;

const GALLERY_DOCUMENT_PENDING = systemAdminDocumentRegistryGalleryRows[1]!;

const GALLERY_DOCUMENT_QUARANTINED = systemAdminDocumentRegistryGalleryRows[2]!;

const GALLERY_DOCUMENT_LEGAL_HOLD = systemAdminDocumentRegistryGalleryRows[3]!;

const GALLERY_DOCUMENT_SENSITIVE = systemAdminDocumentRegistryGalleryRows[4]!;

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

/** Gallery showcases renderers with card chrome — not embedded (no parent SectionPanel). */
const galleryPatternSection = {
  layout: "card" as const,
  cardClassName: "mt-0",
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
    moduleId: systemAdminDocumentRegistryGalleryModuleId,
    documents: [GALLERY_DOCUMENT],
  });
  const documentListQuarantinedSurface = buildDocumentRegistryListSurface({
    moduleId: systemAdminDocumentRegistryGalleryModuleId,
    documents: [GALLERY_DOCUMENT_QUARANTINED],
    canWrite: true,
  });
  const documentListLegalHoldSurface = buildDocumentRegistryListSurface({
    moduleId: systemAdminDocumentRegistryGalleryModuleId,
    documents: [GALLERY_DOCUMENT_LEGAL_HOLD],
    canWrite: true,
    canViewSensitive: true,
  });
  const documentListPendingSurface = buildDocumentRegistryListSurface({
    moduleId: systemAdminDocumentRegistryGalleryModuleId,
    documents: [GALLERY_DOCUMENT_PENDING],
  });
  const documentListSensitiveSurface = buildDocumentRegistryListSurface({
    moduleId: systemAdminDocumentRegistrySensitiveGalleryModuleId,
    documents: [GALLERY_DOCUMENT_SENSITIVE],
    canViewSensitive: false,
  });
  const emptyDocumentListSurface = buildDocumentRegistryListSurface({
    moduleId: systemAdminDocumentRegistryGalleryModuleId,
    documents: [],
  });
  const documentActivitySurface = buildDocumentActivityLinesListSurface({
    moduleId: systemAdminDocumentRegistryGalleryModuleId,
    events: systemAdminDocumentActivityGalleryEvents,
  });
  const documentActivityHrSurface = buildDocumentActivityLinesListSurface({
    moduleId: systemAdminDocumentRegistrySensitiveGalleryModuleId,
    events: systemAdminDocumentActivityHrGalleryEvents,
  });
  const emptyDocumentActivitySurface = buildDocumentActivityLinesListSurface({
    moduleId: systemAdminDocumentRegistryGalleryModuleId,
    events: [],
  });
  const documentQuarantineInboxSurface =
    buildSystemAdminDocumentQuarantineInboxListSurface({
      documents: systemAdminDocumentQuarantineInboxGalleryRows,
      window: {
        pageSize: 25,
        totalCount: systemAdminDocumentQuarantineInboxGalleryRows.length,
        hasNextPage: false,
      },
      canWrite: true,
    });
  const emptyDocumentQuarantineInboxSurface =
    buildSystemAdminDocumentQuarantineInboxListSurface({
      documents: [],
      window: {
        pageSize: 25,
        totalCount: 0,
        hasNextPage: false,
      },
      canWrite: true,
    });
  const savedViewsListSurface = buildSavedViewsListSurface({
    views: [GALLERY_VIEW],
    moduleId: "finance",
  });
  const playbookListSurface = buildLynxRecoveryPlaybookListSurface({
    playbooks: [GALLERY_PLAYBOOK],
  });
  const skillsListSurface = buildLynxOperationalSkillsListSurface({
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
  const emptyKpiStatGrid = buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "kpi",
    presentationProfile: "erp-kpi-grid",
    stats: [],
  });
  const emptyKanbanSurface = {
    dataNature: "kanban" as const,
    interactionMode: "read-only" as const,
    copy: {
      boardAriaLabel: "Empty workflow board",
      emptyColumn: "No items in this stage.",
    },
    columns: [],
    cards: [],
  };
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
    <div className="@container mx-auto flex w-full max-w-page flex-col gap-surface-3xl pb-surface-3xl">
      <header className="border-b border-border pb-surface-lg">
        <p className="type-label">Playground</p>
        <h1 className="mt-2 type-section-title text-foreground">
          Metadata Renderer Gallery
        </h1>
        <p className="mt-2 type-muted">
          Dev-only fixture matrix for governed surface types. Not indexed.
        </p>
      </header>

      {/* ── Pattern C: record list ─────────────────────────────────────── */}
      <GallerySection label="Pattern C — Record list (ready)">
        <GovernedPatternCListSection
          title="Finance records"
          surfaceKey="gallery.finance.records"
          listConfiguration={recordListSurface}
          parentAccessAllowed
          {...galleryPatternSection}
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
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — Work-item list">
        <GovernedPatternCListSection
          title="Work queue"
          surfaceKey="gallery.approvals.work-items"
          listConfiguration={workItemListSurface}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — Document registry">
        <GovernedPatternCListSection
          title="Documents"
          surfaceKey={systemAdminDocumentRegistryGallerySurfaceKey}
          listConfiguration={documentListSurface}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — Document registry (empty)">
        <GovernedPatternCListSection
          title="Documents"
          surfaceKey={`${systemAdminDocumentRegistryGallerySurfaceKey}.empty`}
          listConfiguration={emptyDocumentListSurface}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — Document registry (pending scan)">
        <GovernedPatternCListSection
          title="Documents"
          surfaceKey={`${systemAdminDocumentRegistryGallerySurfaceKey}.pending-scan`}
          listConfiguration={documentListPendingSurface}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — Document registry (sensitive masked)">
        <GovernedPatternCListSection
          title="Documents"
          surfaceKey={`${systemAdminDocumentRegistryGallerySurfaceKey}.sensitive-masked`}
          listConfiguration={documentListSensitiveSurface}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — Document registry (trailing — ready)">
        <GovernedPatternCListSection
          title="Documents"
          surfaceKey={`${systemAdminDocumentRegistryGallerySurfaceKey}.trailing`}
          listConfiguration={buildDocumentRegistryListSurface({
            moduleId: systemAdminDocumentRegistryGalleryModuleId,
            documents: [GALLERY_DOCUMENT],
            canWrite: true,
          })}
          parentAccessAllowed
          {...galleryPatternSection}
          trailingColumn={{
            header: "Actions",
            Cell: SystemAdminDocumentRegistryTrailingCell,
            context: {
              surfaceKey: systemAdminDocumentRegistryGallerySurfaceKey,
              moduleId: systemAdminDocumentRegistryGalleryModuleId,
              organizationLegalHoldActive: false,
            },
          }}
        />
      </GallerySection>

      <GallerySection label="Pattern C — Document registry (trailing — org legal hold)">
        <GovernedPatternCListSection
          title="Documents"
          surfaceKey={`${systemAdminDocumentRegistryGallerySurfaceKey}.trailing.org-hold`}
          listConfiguration={buildDocumentRegistryListSurface({
            moduleId: systemAdminDocumentRegistryGalleryModuleId,
            documents: [GALLERY_DOCUMENT],
            canWrite: true,
          })}
          parentAccessAllowed
          {...galleryPatternSection}
          trailingColumn={{
            header: "Actions",
            Cell: SystemAdminDocumentRegistryTrailingCell,
            context: {
              surfaceKey: systemAdminDocumentRegistryGallerySurfaceKey,
              moduleId: systemAdminDocumentRegistryGalleryModuleId,
              organizationLegalHoldActive: true,
            },
          }}
        />
      </GallerySection>

      <GallerySection label="Pattern C — Document registry (trailing — quarantined scan)">
        <GovernedPatternCListSection
          title="Documents"
          surfaceKey={`${systemAdminDocumentRegistryGallerySurfaceKey}.trailing.quarantine`}
          listConfiguration={documentListQuarantinedSurface}
          parentAccessAllowed
          {...galleryPatternSection}
          trailingColumn={{
            header: "Actions",
            Cell: SystemAdminDocumentRegistryTrailingCell,
            context: {
              surfaceKey: systemAdminDocumentRegistryGallerySurfaceKey,
              moduleId: systemAdminDocumentRegistryGalleryModuleId,
              organizationLegalHoldActive: false,
            },
          }}
        />
      </GallerySection>

      <GallerySection label="Pattern C — Document registry (trailing — legal hold)">
        <GovernedPatternCListSection
          title="Documents"
          surfaceKey={`${systemAdminDocumentRegistryGallerySurfaceKey}.trailing.legal-hold`}
          listConfiguration={documentListLegalHoldSurface}
          parentAccessAllowed
          {...galleryPatternSection}
          trailingColumn={{
            header: "Actions",
            Cell: SystemAdminDocumentRegistryTrailingCell,
            context: {
              surfaceKey: systemAdminDocumentRegistryGallerySurfaceKey,
              moduleId: systemAdminDocumentRegistryGalleryModuleId,
              organizationLegalHoldActive: false,
            },
          }}
        />
      </GallerySection>

      <GallerySection label="Pattern C — Document activity (document-lines)">
        <GovernedPatternCListSection
          title="Document activity"
          description="Upload, download, retention, and governance events."
          surfaceKey={systemAdminDocumentActivityGallerySurfaceKey}
          listConfiguration={documentActivitySurface}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — Document activity (hr vault union)">
        <GovernedPatternCListSection
          title="Document activity"
          description="HR vault events with downloadable evidence links."
          surfaceKey={systemAdminDocumentActivityHrGallerySurfaceKey}
          listConfiguration={documentActivityHrSurface}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — Document activity (empty)">
        <GovernedPatternCListSection
          title="Document activity"
          surfaceKey={`${systemAdminDocumentActivityGallerySurfaceKey}.empty`}
          listConfiguration={emptyDocumentActivitySurface}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — System admin quarantine inbox (ready)">
        <GovernedPatternCListSection
          title="Quarantine inbox"
          surfaceKey={systemAdminDocumentQuarantineInboxSurfaceKey}
          listConfiguration={documentQuarantineInboxSurface}
          parentAccessAllowed
          {...galleryPatternSection}
          trailingColumn={{
            header: "Actions",
            Cell: SystemAdminDocumentQuarantineTrailingCell,
            context: {
              surfaceKey: systemAdminDocumentQuarantineInboxSurfaceKey,
              organizationLegalHoldActive: false,
            },
          }}
        />
      </GallerySection>

      <GallerySection label="Pattern C — System admin quarantine inbox (org legal hold)">
        <GovernedPatternCListSection
          title="Quarantine inbox"
          surfaceKey={`${systemAdminDocumentQuarantineInboxSurfaceKey}.org-hold`}
          listConfiguration={documentQuarantineInboxSurface}
          parentAccessAllowed
          {...galleryPatternSection}
          trailingColumn={{
            header: "Actions",
            Cell: SystemAdminDocumentQuarantineTrailingCell,
            context: {
              surfaceKey: systemAdminDocumentQuarantineInboxSurfaceKey,
              organizationLegalHoldActive: true,
            },
          }}
        />
      </GallerySection>

      <GallerySection label="Pattern C — System admin quarantine inbox (empty)">
        <GovernedPatternCListSection
          title="Quarantine inbox"
          surfaceKey={`${systemAdminDocumentQuarantineInboxSurfaceKey}.empty`}
          listConfiguration={emptyDocumentQuarantineInboxSurface}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — Saved views">
        <GovernedPatternCListSection
          title="Saved views"
          surfaceKey="gallery.finance.saved-views"
          listConfiguration={savedViewsListSurface}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — Recovery playbooks">
        <GovernedPatternCListSection
          title="Playbooks"
          surfaceKey="gallery.lynx.playbooks"
          listConfiguration={playbookListSurface}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — Operational skills">
        <GovernedPatternCListSection
          title="Skills"
          surfaceKey="gallery.lynx.skills"
          listConfiguration={skillsListSurface}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — System admin users (ready)">
        <GovernedPatternCListSection
          title="Organization users"
          surfaceKey={systemAdminUsersSurfaceKey}
          listConfiguration={buildUsersListSurface({
            users: systemAdminUsersGalleryRows,
            canMutate: true,
          })}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — System admin users (empty)">
        <GovernedPatternCListSection
          title="Organization users"
          surfaceKey={`${systemAdminUsersSurfaceKey}.empty`}
          listConfiguration={buildUsersListSurface({ users: [], canMutate: true })}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — System admin memberships (ready)">
        <GovernedPatternCListSection
          title="Organization memberships"
          surfaceKey={systemAdminMembersSurfaceKey}
          listConfiguration={buildMembersListSurface({
            memberships: systemAdminMembershipsGalleryRows,
            canMutate: true,
            canManageRoles: true,
          })}
          parentAccessAllowed
          {...galleryPatternSection}
          trailingColumn={{
            header: "Actions",
            Cell: SystemAdminMembershipTrailingCell,
          }}
        />
      </GallerySection>

      <GallerySection label="Pattern C — System admin memberships (empty)">
        <GovernedPatternCListSection
          title="Organization memberships"
          surfaceKey={`${systemAdminMembersSurfaceKey}.empty`}
          listConfiguration={buildMembersListSurface({
            memberships: [],
            canMutate: true,
          })}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — System admin approvals (ready)">
        <GovernedPatternCListSection
          title="Approval rules"
          surfaceKey={systemAdminApprovalsSurfaceKey}
          listConfiguration={buildApprovalsListSurface({
            approvals: systemAdminApprovalsGalleryRows,
            canMutate: true,
          })}
          parentAccessAllowed
          {...galleryPatternSection}
          trailingColumn={{
            header: systemAdminApprovalsUiCopy.list.actionsHeader,
            Cell: SystemAdminApprovalTrailingCell,
            context: { surfaceKey: systemAdminApprovalsSurfaceKey },
          }}
        />
      </GallerySection>

      <GallerySection label="Pattern C — System admin approvals (read only)">
        <GovernedPatternCListSection
          title="Approval rules"
          surfaceKey={`${systemAdminApprovalsSurfaceKey}.read-only`}
          listConfiguration={buildApprovalsListSurface({
            approvals: systemAdminApprovalsGalleryRows,
            canMutate: false,
          })}
          parentAccessAllowed
          {...galleryPatternSection}
          trailingColumn={{
            header: systemAdminApprovalsUiCopy.list.actionsHeader,
            Cell: SystemAdminApprovalTrailingCell,
            context: { surfaceKey: systemAdminApprovalsSurfaceKey },
          }}
        />
      </GallerySection>

      <GallerySection label="Pattern C — System admin approvals (empty)">
        <GovernedPatternCListSection
          title="Approval rules"
          surfaceKey={`${systemAdminApprovalsSurfaceKey}.empty`}
          listConfiguration={buildApprovalsListSurface({
            approvals: [],
            canMutate: true,
          })}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — System admin approval queue (decide ready)">
        <GovernedPatternCListSection
          title={systemAdminApprovalsUiCopy.queue.title}
          surfaceKey={systemAdminApprovalsQueueSurfaceKey}
          listConfiguration={buildSystemAdminApprovalQueueListSurface({
            rows: systemAdminApprovalsQueueGalleryRows,
            canDecide: true,
          })}
          parentAccessAllowed
          {...galleryPatternSection}
          trailingColumn={{
            header: systemAdminApprovalsUiCopy.queue.actionsHeader,
            Cell: SystemAdminApprovalQueueTrailingCell,
            context: { surfaceKey: systemAdminApprovalsQueueSurfaceKey },
          }}
        />
      </GallerySection>

      <GallerySection label="Pattern C — System admin approval queue (read only)">
        <GovernedPatternCListSection
          title={systemAdminApprovalsUiCopy.queue.title}
          surfaceKey={`${systemAdminApprovalsQueueSurfaceKey}.read-only`}
          listConfiguration={buildSystemAdminApprovalQueueListSurface({
            rows: systemAdminApprovalsQueueGalleryRows,
            canDecide: false,
          })}
          parentAccessAllowed
          {...galleryPatternSection}
          trailingColumn={{
            header: systemAdminApprovalsUiCopy.queue.actionsHeader,
            Cell: SystemAdminApprovalQueueTrailingCell,
            context: { surfaceKey: systemAdminApprovalsQueueSurfaceKey },
          }}
        />
      </GallerySection>

      <GallerySection label="Pattern C — System admin approval queue (empty)">
        <GovernedPatternCListSection
          title={systemAdminApprovalsUiCopy.queue.title}
          surfaceKey={`${systemAdminApprovalsQueueSurfaceKey}.empty`}
          listConfiguration={buildSystemAdminApprovalQueueListSurface({
            rows: [],
            canDecide: true,
          })}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="System admin approval detail (fixture)">
        <SystemAdminApprovalDetailPanel
          detail={systemAdminApprovalDetailGalleryFixture}
          backHref="/system-admin/approvals"
        />
      </GallerySection>

      <GallerySection label="System admin approval detail (deprecated)">
        <SystemAdminApprovalDetailPanel
          detail={systemAdminApprovalDetailDeprecatedGalleryFixture}
          backHref="/system-admin/approvals"
        />
      </GallerySection>

      <GallerySection label="Pattern C — System admin audit viewer (ready)">
        <GovernedPatternCListSection
          title={systemAdminAuditUiCopy.auditList.title}
          description={systemAdminAuditUiCopy.auditList.description}
          surfaceKey={systemAdminAuditViewerSurfaceKey}
          listConfiguration={buildSystemAdminAuditViewerListSurface({
            rows: systemAdminAuditViewerGalleryRows,
            params: { auditPage: 1, auditPageSize: 25 },
            totalCount: systemAdminAuditViewerGalleryRows.length,
            pageSize: 25,
            page: 1,
            hasNextPage: false,
          })}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="Pattern C — System admin audit viewer (empty)">
        <GovernedPatternCListSection
          title={systemAdminAuditUiCopy.auditList.title}
          surfaceKey={`${systemAdminAuditViewerSurfaceKey}.empty`}
          listConfiguration={buildSystemAdminAuditViewerListSurface({
            rows: [],
            params: { auditPage: 1, auditPageSize: 25 },
            totalCount: 0,
            pageSize: 25,
            page: 1,
            hasNextPage: false,
          })}
          parentAccessAllowed
          {...galleryPatternSection}
        />
      </GallerySection>

      <GallerySection label="System admin audit coverage (fixture)">
        <SystemAdminAuditCoveragePanel gaps={systemAdminAuditCoverageGalleryGaps} />
      </GallerySection>

      <GallerySection label="System admin audit detail (fixture)">
        <SystemAdminAuditDetailPanel
          detail={systemAdminAuditDetailGalleryFixture}
          backHref="/system-admin/audit"
        />
      </GallerySection>

      {/* ── Pattern B: stat sections ───────────────────────────────────── */}
      <GallerySection label="Pattern B — Workspace count stats">
        <GovernedPatternBStatSection
          title="Workspace counts"
          surfaceKey="gallery.finance.counts"
          {...galleryPatternSection}
          statGroups={[{ groupKey: "counts", configuration: workspaceCountStats }]}
        />
      </GallerySection>

      <GallerySection label="Pattern B — KPI stat grid">
        <GovernedPatternBStatSection
          title="Module KPIs"
          surfaceKey="gallery.finance.kpis"
          {...galleryPatternSection}
          statGroups={[{ groupKey: "kpis", configuration: kpiStatGrid }]}
        />
      </GallerySection>

      <GallerySection label="Pattern B — KPI stat grid (empty)">
        <GovernedPatternBStatSection
          title="Module KPIs"
          surfaceKey="gallery.finance.kpis.empty"
          {...galleryPatternSection}
          statGroups={[{ groupKey: "kpis", configuration: emptyKpiStatGrid }]}
        />
      </GallerySection>

      <GallerySection label="Pattern B — Stat section (forbidden)">
        <GovernedPatternBStatSection
          title="Restricted metrics"
          surfaceKey="gallery.finance.kpis.forbidden"
          {...galleryPatternSection}
          forbidden={{
            variant: "forbidden",
            title: "You do not have access to this surface",
            description:
              "Your organization role does not include permission to view this data.",
          }}
          statGroups={[{ groupKey: "kpis", configuration: kpiStatGrid }]}
        />
      </GallerySection>

      <GallerySection label="Approval timeline (empty)">
        <div className="surface-card p-surface-lg">
          <GovernedComponentRenderer
            surfaceKey="gallery.approvals.timeline.empty"
            component={{
              type: "governed:approval-timeline",
              serverType: "governed:approval-timeline",
              configuration: {
                dataNature: "approval-flow",
                title: "Approval flow",
                steps: [],
              },
            }}
          />
        </div>
      </GallerySection>

      {/* ── Pattern B: chart section ───────────────────────────────────── */}
      <GallerySection label="Pattern B — Chart (categorical bar)">
        <GovernedPatternBChartSection
          title="Hardening status"
          surfaceKey={dashboardHardeningChartSurfaceKey}
          chartConfiguration={hardeningChart}
          {...galleryPatternSection}
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

      <GallerySection label="Kanban — Empty board">
        <GovernedKanbanFooterSection
          surfaceKey="gallery.approvals.kanban.empty"
          title="Empty workflow board"
          layout="titled"
        >
          <GovernedKanbanReadOnlyBoard
            configuration={emptyKanbanSurface}
            surfaceKey="gallery.approvals.kanban.empty"
          />
        </GovernedKanbanFooterSection>
      </GallerySection>

      {/* ── Detail tabs ─────────────────────────────────────────────────── */}
      <GallerySection label="Detail tabs — Record detail">
        <pre className="surface-inset max-h-96 overflow-auto p-surface-lg type-mono-muted">
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
    <section className="flex flex-col gap-surface-md">
      <div className="flex items-center gap-surface-md">
        <span className="type-caption shrink-0 rounded-chip border border-border bg-surface-muted px-2 py-1 font-mono">
          {label}
        </span>
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
