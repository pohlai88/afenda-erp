import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  lte,
  or,
  sql,
  sum,
  type SQL,
} from "drizzle-orm";
import { insertAuditLog } from "./audit";
import {
  isErpDocumentRowOnLegalHold,
  isOrganizationDocumentLegalHoldActive,
} from "./document-legal-hold.server";
import { getDb, runWithOrganizationContext } from "./client";
import type { AfendaTransaction } from "./tenant-context";
import { createEntityId } from "./ids";
import {
  auditLogs,
  erpDocuments,
  erpModuleRecords,
  erpSavedViews,
  erpWorkItems,
  organizations,
} from "./schema";
import { hrEmployeeDocuments } from "./hr";

import {
  clampPageSize,
} from "./list-window.shared";
import {
  coreModuleIds,
  moduleIds,
  type ModuleId,
} from "@afenda/config/module-ids";

export const erpModuleIds = moduleIds;

export type ErpModuleId = ModuleId;
export type CoreErpModuleId = Exclude<ErpModuleId, "dashboard">;

export type ErpRecordStatus =
  | "draft"
  | "active"
  | "blocked"
  | "ready"
  | "closed";
export type ErpWorkItemStatus =
  | "pending"
  | "in-review"
  | "escalated"
  | "scheduled"
  | "completed";
export type ErpPriority = "low" | "medium" | "high";
export type ErpViewVisibility = "private" | "team" | "tenant";
export type ErpDocumentAccess = "private" | "public";

export const erpRecordStatuses = [
  "draft",
  "active",
  "blocked",
  "ready",
  "closed",
] as const satisfies readonly ErpRecordStatus[];
export const erpWorkItemStatuses = [
  "pending",
  "in-review",
  "escalated",
  "scheduled",
  "completed",
] as const satisfies readonly ErpWorkItemStatus[];
export const erpPriorities = [
  "low",
  "medium",
  "high",
] as const satisfies readonly ErpPriority[];

export type TenantErpRecordSort = "due-asc" | "updated-desc" | "reference-asc";
export type TenantErpWorkItemSort =
  | "due-asc"
  | "updated-desc"
  | "priority-desc";

export type TenantErpRecordWindowQuery = {
  cursor?: string;
  sort?: TenantErpRecordSort;
  status?: ErpRecordStatus;
  recordType?: string;
};

export type TenantErpWorkItemWindowQuery = {
  cursor?: string;
  sort?: TenantErpWorkItemSort;
  status?: ErpWorkItemStatus;
  priority?: ErpPriority;
};

export type ErpDocumentRetentionClass = "standard" | "short-term" | "legal-hold";

export type ErpDocumentClassification =
  | "public"
  | "internal"
  | "confidential"
  | "restricted"
  | "highly-restricted"
  | "regulated";

export type ErpDocumentScanStatus =
  | "pending"
  | "scanning"
  | "passed"
  | "failed"
  | "quarantined";

export type TenantErpDocument = {
  id: string;
  title: string;
  contentType: string;
  sizeBytes: number;
  access: ErpDocumentAccess;
  /** ETag returned by Vercel Blob — the store's content integrity identifier. */
  blobEtag: string | null;
  classification: ErpDocumentClassification;
  retentionClass: ErpDocumentRetentionClass;
  scanStatus: ErpDocumentScanStatus;
  createdAt: Date;
};

export type TenantErpDocumentWindowQuery = {
  cursor?: string;
};

export type TenantErpDocumentWindow = {
  rows: readonly TenantErpDocument[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

export type TenantErpDocumentQuarantineRow = TenantErpDocument & {
  moduleId: ErpModuleId;
};

export type TenantErpDocumentQuarantineWindowQuery = {
  cursor?: string;
};

export type TenantErpDocumentQuarantineWindow = {
  rows: readonly TenantErpDocumentQuarantineRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

export type TenantErpRecord = {
  id: string;
  reference: string;
  title: string;
  recordType: string;
  status: ErpRecordStatus;
  owner: string;
  amountCents: number | null;
  currency: string;
  dueAt: Date | null;
  metadata: Record<string, unknown>;
  updatedAt: Date;
};

export type TenantErpRecordWindow = {
  rows: readonly TenantErpRecord[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

export type TenantErpSavedView = {
  id: string;
  name: string;
  description: string;
  visibility: ErpViewVisibility;
};

export type TenantErpWorkItem = {
  id: string;
  moduleId: ErpModuleId;
  subject: string;
  owner: string;
  status: ErpWorkItemStatus;
  priority: ErpPriority;
  dueAt: Date;
  updatedAt: Date;
  sourceRecordId: string | null;
  metadata: Record<string, unknown>;
};

export type TenantErpWorkItemDetail = TenantErpWorkItem;

export type ApprovalWorkItemDecision = "approve" | "reject";

export type ApprovalWorkItemCommandErrorCode =
  | "work_item_not_found"
  | "work_item_not_actionable"
  | "wrong_module"
  | "rejection_reason_required";

export class ApprovalWorkItemCommandError extends Error {
  readonly code: ApprovalWorkItemCommandErrorCode;

  constructor(code: ApprovalWorkItemCommandErrorCode) {
    super(code);
    this.name = "ApprovalWorkItemCommandError";
    this.code = code;
  }
}

const approvalActionableWorkItemStatuses = [
  "pending",
  "in-review",
  "escalated",
  "scheduled",
] as const satisfies readonly ErpWorkItemStatus[];

export type TenantErpWorkItemWindow = {
  rows: readonly TenantErpWorkItem[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

import {
  decodeWindowOffset,
  encodeWindowOffset,
} from "./window-pagination.shared";

function recordOrderBy(sort: TenantErpRecordSort | undefined): SQL[] {
  switch (sort) {
    case "reference-asc":
      return [asc(erpModuleRecords.reference), asc(erpModuleRecords.id)];
    case "updated-desc":
      return [desc(erpModuleRecords.updatedAt), asc(erpModuleRecords.id)];
    case "due-asc":
    default:
      return [
        asc(erpModuleRecords.dueAt),
        desc(erpModuleRecords.updatedAt),
        asc(erpModuleRecords.id),
      ];
  }
}

function workItemOrderBy(sort: TenantErpWorkItemSort | undefined): SQL[] {
  switch (sort) {
    case "priority-desc":
      return [
        sql`case ${erpWorkItems.priority} when 'high' then 0 when 'medium' then 1 else 2 end`,
        asc(erpWorkItems.dueAt),
        asc(erpWorkItems.id),
      ];
    case "updated-desc":
      return [desc(erpWorkItems.updatedAt), asc(erpWorkItems.id)];
    case "due-asc":
    default:
      return [
        asc(erpWorkItems.dueAt),
        desc(erpWorkItems.updatedAt),
        asc(erpWorkItems.id),
      ];
  }
}

type ModuleSeedRecord = {
  moduleId: CoreErpModuleId;
  recordType: string;
  reference: string;
  title: string;
  status: ErpRecordStatus;
  owner: string;
  amountCents?: number;
  dueInDays: number;
  metadata: Record<string, unknown>;
};

type ModuleSeedWorkItem = {
  moduleId: CoreErpModuleId;
  subject: string;
  owner: string;
  status: ErpWorkItemStatus;
  priority: ErpPriority;
  dueInDays: number;
  metadata: Record<string, unknown>;
};

type ModuleSeedView = {
  moduleId: ErpModuleId;
  name: string;
  description: string;
  visibility: ErpViewVisibility;
  filter: Record<string, unknown>;
};

const moduleSeedRecords: readonly ModuleSeedRecord[] = [
  {
    moduleId: "finance",
    recordType: "close-control",
    reference: "FIN-CLOSE-001",
    title: "Month-end accrual review",
    status: "blocked",
    owner: "Finance Controller",
    amountCents: 12400000,
    dueInDays: 2,
    metadata: { control: "accruals", risk: "period-close" },
  },
  {
    moduleId: "sales",
    recordType: "sales-order",
    reference: "SO-2291",
    title: "Enterprise order credit review",
    status: "active",
    owner: "Commercial Manager",
    amountCents: 7850000,
    dueInDays: 1,
    metadata: { customerTier: "enterprise", blocker: "credit-override" },
  },
  {
    moduleId: "purchasing",
    recordType: "purchase-order",
    reference: "PO-883",
    title: "Supplier hold release",
    status: "blocked",
    owner: "Procurement Lead",
    amountCents: 3620000,
    dueInDays: 3,
    metadata: { supplierRisk: "compliance-hold", requiresApproval: true },
  },
  {
    moduleId: "inventory",
    recordType: "stock-variance",
    reference: "INV-VAR-014",
    title: "Cycle count variance at Shah Alam DC",
    status: "active",
    owner: "Warehouse Supervisor",
    dueInDays: 1,
    metadata: { location: "Shah Alam DC", varianceType: "count-mismatch" },
  },
  {
    moduleId: "hr",
    recordType: "people-change",
    reference: "HR-CHG-006",
    title: "Support lead backdated leave review",
    status: "draft",
    owner: "People Operations",
    dueInDays: 4,
    metadata: { policy: "leave-exception", sensitive: true },
  },
  {
    moduleId: "crm",
    recordType: "account-risk",
    reference: "CRM-REN-005",
    title: "Renewal watchlist account follow-up",
    status: "active",
    owner: "Revenue Operations",
    amountCents: 4180000,
    dueInDays: 5,
    metadata: { segment: "renewal", activityGapDays: 5 },
  },
  {
    moduleId: "approvals",
    recordType: "approval-request",
    reference: "APR-CAPEX-001",
    title: "Warehouse scanner rollout capex",
    status: "blocked",
    owner: "Finance Controller",
    amountCents: 5600000,
    dueInDays: 1,
    metadata: { approvalRoute: "capex", escalation: true },
  },
  {
    moduleId: "reports",
    recordType: "saved-report",
    reference: "RPT-FRESH-001",
    title: "Operations snapshot freshness review",
    status: "ready",
    owner: "Data and Insights",
    dueInDays: 2,
    metadata: { freshnessTargetMinutes: 60, exportable: true },
  },
  {
    moduleId: "system-admin",
    recordType: "governance-review",
    reference: "ADM-ROLE-002",
    title: "Privileged role assignment review",
    status: "active",
    owner: "Platform Administration",
    dueInDays: 7,
    metadata: { governanceArea: "membership", reviewCadence: "weekly" },
  },
];

const moduleSeedWorkItems: readonly ModuleSeedWorkItem[] = [
  {
    moduleId: "approvals",
    subject: "Capex request for warehouse scanner rollout",
    owner: "Finance Controller",
    status: "escalated",
    priority: "high",
    dueInDays: 1,
    metadata: { source: "capex", route: "approvals" },
  },
  {
    moduleId: "finance",
    subject: "Invoice 10492 blocked by receipt mismatch",
    owner: "AP Analyst",
    status: "pending",
    priority: "high",
    dueInDays: 1,
    metadata: { source: "invoice-hold", route: "finance" },
  },
  {
    moduleId: "purchasing",
    subject: "PO-883 supplier hold review",
    owner: "Procurement Lead",
    status: "in-review",
    priority: "medium",
    dueInDays: 2,
    metadata: { source: "supplier-hold", route: "purchasing" },
  },
  {
    moduleId: "inventory",
    subject: "Cycle count variance at Shah Alam DC",
    owner: "Warehouse Supervisor",
    status: "pending",
    priority: "medium",
    dueInDays: 2,
    metadata: { source: "stock-variance", route: "inventory" },
  },
  {
    moduleId: "hr",
    subject: "Backdated leave approval for support lead",
    owner: "People Operations",
    status: "scheduled",
    priority: "low",
    dueInDays: 4,
    metadata: { source: "leave-exception", route: "hr" },
  },
  {
    moduleId: "sales",
    subject: "Credit override for enterprise order SO-2291",
    owner: "Commercial Manager",
    status: "in-review",
    priority: "high",
    dueInDays: 1,
    metadata: { source: "sales-order", route: "sales" },
  },
];

const moduleSeedViews: readonly ModuleSeedView[] = erpModuleIds
  .filter((moduleId) => moduleId !== "system-admin")
  .flatMap((moduleId) => [
    {
      moduleId,
      name: "Action queue",
      description:
        "Open records and work items that require route-owner action.",
      visibility: "team",
      filter: { status: ["active", "blocked"], sort: "dueAt" },
    },
    {
      moduleId,
      name: "Control review",
      description: "Governance, exception, and approval-sensitive records.",
      visibility: "tenant",
      filter: { risk: true, includeAuditRequired: true },
    },
  ]);

function addDays(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(9, 0, 0, 0);

  return date;
}

export async function listTenantErpRecords(input: {
  organizationId: string;
  moduleId: ErpModuleId;
  limit?: number;
  query?: TenantErpRecordWindowQuery;
}) {
  const window = await listTenantErpRecordWindow(input);

  return window.rows;
}

export async function listTenantErpRecordWindow(input: {
  organizationId: string;
  moduleId: ErpModuleId;
  limit?: number;
  query?: TenantErpRecordWindowQuery;
}): Promise<TenantErpRecordWindow> {
  const pageSize = input.limit ?? 6;
  const offset = decodeWindowOffset(input.query?.cursor);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const whereClauses = [
      eq(erpModuleRecords.organizationId, input.organizationId),
      eq(erpModuleRecords.moduleId, input.moduleId),
    ];

    if (input.query?.status) {
      whereClauses.push(eq(erpModuleRecords.status, input.query.status));
    }

    if (input.query?.recordType) {
      whereClauses.push(
        eq(erpModuleRecords.recordType, input.query.recordType),
      );
    }

    const whereClause = and(...whereClauses);
    const [rows, totalRows] = await Promise.all([
      db
        .select({
          id: erpModuleRecords.id,
          reference: erpModuleRecords.reference,
          title: erpModuleRecords.title,
          recordType: erpModuleRecords.recordType,
          status: erpModuleRecords.status,
          owner: erpModuleRecords.owner,
          amountCents: erpModuleRecords.amountCents,
          currency: erpModuleRecords.currency,
          dueAt: erpModuleRecords.dueAt,
          metadata: erpModuleRecords.metadata,
          updatedAt: erpModuleRecords.updatedAt,
        })
        .from(erpModuleRecords)
        .where(whereClause)
        .orderBy(...recordOrderBy(input.query?.sort))
        .limit(pageSize + 1)
        .offset(offset),
      db.select({ value: count() }).from(erpModuleRecords).where(whereClause),
    ]);
    const visibleRows = rows.slice(0, pageSize);
    const hasNextPage = rows.length > pageSize;
    const nextCursor = hasNextPage
      ? encodeWindowOffset(offset + pageSize)
      : undefined;

    return {
      rows: visibleRows,
      pageSize,
      totalCount: Number(totalRows[0]?.value ?? 0),
      hasNextPage,
      ...(nextCursor ? { nextCursor } : {}),
    };
  });
}

export async function getTenantErpRecord(input: {
  organizationId: string;
  moduleId: ErpModuleId;
  recordId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        id: erpModuleRecords.id,
        reference: erpModuleRecords.reference,
        title: erpModuleRecords.title,
        recordType: erpModuleRecords.recordType,
        status: erpModuleRecords.status,
        owner: erpModuleRecords.owner,
        amountCents: erpModuleRecords.amountCents,
        currency: erpModuleRecords.currency,
        dueAt: erpModuleRecords.dueAt,
        metadata: erpModuleRecords.metadata,
        updatedAt: erpModuleRecords.updatedAt,
      })
      .from(erpModuleRecords)
      .where(
        and(
          eq(erpModuleRecords.organizationId, input.organizationId),
          eq(erpModuleRecords.moduleId, input.moduleId),
          eq(erpModuleRecords.id, input.recordId),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  });
}

export async function listTenantSavedViews(input: {
  organizationId: string;
  moduleId: ErpModuleId;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    return db
      .select({
        id: erpSavedViews.id,
        name: erpSavedViews.name,
        description: erpSavedViews.description,
        visibility: erpSavedViews.visibility,
      })
      .from(erpSavedViews)
      .where(
        and(
          eq(erpSavedViews.organizationId, input.organizationId),
          eq(erpSavedViews.moduleId, input.moduleId),
        ),
      )
      .orderBy(asc(erpSavedViews.name));
  });
}

export async function listTenantWorkItems(input: {
  organizationId: string;
  moduleId?: ErpModuleId;
  limit?: number;
  query?: TenantErpWorkItemWindowQuery;
}) {
  const window = await listTenantWorkItemWindow(input);

  return window.rows;
}

export async function createTenantWorkItemForApprovedSandbox(input: {
  organizationId: string;
  moduleId: ErpModuleId;
  sandboxId: string;
  title: string;
  actorAuthUserId: string;
  sourceRecordId?: string | null;
  priority?: ErpPriority;
}): Promise<string> {
  const subject = `[AI] ${input.title}`.slice(0, 240);
  const workItemId = createEntityId("work");
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 7);

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(erpWorkItems).values({
      id: workItemId,
      organizationId: input.organizationId,
      moduleId: input.moduleId,
      subject,
      owner: input.actorAuthUserId,
      status: "pending",
      priority: input.priority ?? "medium",
      dueAt,
      sourceRecordId: input.sourceRecordId ?? null,
      createdByAuthUserId: input.actorAuthUserId,
      updatedByAuthUserId: input.actorAuthUserId,
      metadata: {
        sandboxId: input.sandboxId,
        source: "ai-sandbox-executor",
      },
    });
  });

  return workItemId;
}

export async function getTenantWorkItem(input: {
  organizationId: string;
  moduleId: ErpModuleId;
  workItemId: string;
}): Promise<TenantErpWorkItemDetail | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        id: erpWorkItems.id,
        moduleId: erpWorkItems.moduleId,
        subject: erpWorkItems.subject,
        owner: erpWorkItems.owner,
        status: erpWorkItems.status,
        priority: erpWorkItems.priority,
        dueAt: erpWorkItems.dueAt,
        updatedAt: erpWorkItems.updatedAt,
        sourceRecordId: erpWorkItems.sourceRecordId,
        metadata: erpWorkItems.metadata,
      })
      .from(erpWorkItems)
      .where(
        and(
          eq(erpWorkItems.organizationId, input.organizationId),
          eq(erpWorkItems.moduleId, input.moduleId),
          eq(erpWorkItems.id, input.workItemId),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  });
}

export async function applyTenantApprovalWorkItemDecision(input: {
  organizationId: string;
  workItemId: string;
  decision: ApprovalWorkItemDecision;
  actorAuthUserId: string;
  decisionNote?: string | null;
  rejectionReason?: string | null;
}): Promise<{
  workItemId: string;
  workItemStatus: ErpWorkItemStatus;
  sourceRecordId: string | null;
  recordStatus: ErpRecordStatus | null;
}> {
  const workItem = await getTenantWorkItem({
    organizationId: input.organizationId,
    moduleId: "approvals",
    workItemId: input.workItemId,
  });

  if (!workItem) {
    throw new ApprovalWorkItemCommandError("work_item_not_found");
  }

  if (workItem.moduleId !== "approvals") {
    throw new ApprovalWorkItemCommandError("wrong_module");
  }

  if (
    !approvalActionableWorkItemStatuses.includes(
      workItem.status as (typeof approvalActionableWorkItemStatuses)[number],
    )
  ) {
    throw new ApprovalWorkItemCommandError("work_item_not_actionable");
  }

  if (input.decision === "reject" && !input.rejectionReason?.trim()) {
    throw new ApprovalWorkItemCommandError("rejection_reason_required");
  }

  const decidedAt = new Date();
  const nextMetadata: Record<string, unknown> = {
    ...workItem.metadata,
    decision: input.decision === "approve" ? "approved" : "rejected",
    decidedAt: decidedAt.toISOString(),
    decidedByAuthUserId: input.actorAuthUserId,
  };

  const trimmedNote = input.decisionNote?.trim();
  if (trimmedNote) {
    nextMetadata.decisionNote = trimmedNote;
  }

  const trimmedRejectionReason = input.rejectionReason?.trim();
  if (input.decision === "reject" && trimmedRejectionReason) {
    nextMetadata.rejectionReason = trimmedRejectionReason;
  }

  let recordStatus: ErpRecordStatus | null = null;

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(erpWorkItems)
      .set({
        status: "completed",
        metadata: nextMetadata,
        updatedAt: decidedAt,
        updatedByAuthUserId: input.actorAuthUserId,
      })
      .where(
        and(
          eq(erpWorkItems.organizationId, input.organizationId),
          eq(erpWorkItems.id, input.workItemId),
        ),
      );

    if (workItem.sourceRecordId) {
      recordStatus = input.decision === "approve" ? "active" : "closed";
      await db
        .update(erpModuleRecords)
        .set({
          status: recordStatus,
          updatedAt: decidedAt,
          updatedByAuthUserId: input.actorAuthUserId,
        })
        .where(
          and(
            eq(erpModuleRecords.organizationId, input.organizationId),
            eq(erpModuleRecords.id, workItem.sourceRecordId),
          ),
        );
    }
  });

  return {
    workItemId: input.workItemId,
    workItemStatus: "completed",
    sourceRecordId: workItem.sourceRecordId,
    recordStatus,
  };
}

export async function listTenantWorkItemWindow(input: {
  organizationId: string;
  moduleId?: ErpModuleId;
  limit?: number;
  query?: TenantErpWorkItemWindowQuery;
}): Promise<TenantErpWorkItemWindow> {
  const pageSize = input.limit ?? 8;
  const offset = decodeWindowOffset(input.query?.cursor);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const whereClauses = [
      eq(erpWorkItems.organizationId, input.organizationId),
    ];

    if (input.moduleId) {
      whereClauses.push(eq(erpWorkItems.moduleId, input.moduleId));
    }

    if (input.query?.status) {
      whereClauses.push(eq(erpWorkItems.status, input.query.status));
    }

    if (input.query?.priority) {
      whereClauses.push(eq(erpWorkItems.priority, input.query.priority));
    }

    const whereClause = and(...whereClauses);
    const [rows, totalRows] = await Promise.all([
      db
        .select({
          id: erpWorkItems.id,
          moduleId: erpWorkItems.moduleId,
          subject: erpWorkItems.subject,
          owner: erpWorkItems.owner,
          status: erpWorkItems.status,
          priority: erpWorkItems.priority,
          dueAt: erpWorkItems.dueAt,
          updatedAt: erpWorkItems.updatedAt,
          sourceRecordId: erpWorkItems.sourceRecordId,
          metadata: erpWorkItems.metadata,
        })
        .from(erpWorkItems)
        .where(whereClause)
        .orderBy(...workItemOrderBy(input.query?.sort))
        .limit(pageSize + 1)
        .offset(offset),
      db.select({ value: count() }).from(erpWorkItems).where(whereClause),
    ]);
    const visibleRows = rows.slice(0, pageSize);
    const hasNextPage = rows.length > pageSize;
    const nextCursor = hasNextPage
      ? encodeWindowOffset(offset + pageSize)
      : undefined;

    return {
      rows: visibleRows,
      pageSize,
      totalCount: Number(totalRows[0]?.value ?? 0),
      hasNextPage,
      ...(nextCursor ? { nextCursor } : {}),
    };
  });
}

export async function listTenantDocumentWindow(input: {
  organizationId: string;
  moduleId: ErpModuleId;
  limit?: number;
  query?: TenantErpDocumentWindowQuery;
}): Promise<TenantErpDocumentWindow> {
  const pageSize = input.limit ?? 6;
  const offset = decodeWindowOffset(input.query?.cursor);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const whereClause = and(
      eq(erpDocuments.organizationId, input.organizationId),
      eq(erpDocuments.moduleId, input.moduleId),
    );
    const [rows, totalRows] = await Promise.all([
      db
        .select({
        id: erpDocuments.id,
        title: erpDocuments.title,
        contentType: erpDocuments.contentType,
        sizeBytes: erpDocuments.sizeBytes,
        access: erpDocuments.access,
        blobEtag: erpDocuments.blobEtag,
        classification: erpDocuments.classification,
        retentionClass: erpDocuments.retentionClass,
        scanStatus: erpDocuments.scanStatus,
        createdAt: erpDocuments.createdAt,
        })
        .from(erpDocuments)
        .where(whereClause)
        .orderBy(desc(erpDocuments.createdAt))
        .limit(pageSize + 1)
        .offset(offset),
      db.select({ value: count() }).from(erpDocuments).where(whereClause),
    ]);
    const visibleRows = rows.slice(0, pageSize);
    const hasNextPage = rows.length > pageSize;
    const nextCursor = hasNextPage
      ? encodeWindowOffset(offset + pageSize)
      : undefined;

    return {
      rows: visibleRows,
      pageSize,
      totalCount: Number(totalRows[0]?.value ?? 0),
      hasNextPage,
      ...(nextCursor ? { nextCursor } : {}),
    };
  });
}

export async function listTenantDocuments(input: {
  organizationId: string;
  moduleId: ErpModuleId;
  limit?: number;
  query?: TenantErpDocumentWindowQuery;
}) {
  const window = await listTenantDocumentWindow(input);
  return window.rows;
}

export async function getTenantDocument(input: {
  organizationId: string;
  documentId: string;
  moduleId: ErpModuleId;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        id: erpDocuments.id,
        title: erpDocuments.title,
        pathname: erpDocuments.pathname,
        blobUrl: erpDocuments.blobUrl,
        contentType: erpDocuments.contentType,
        sizeBytes: erpDocuments.sizeBytes,
        access: erpDocuments.access,
        moduleId: erpDocuments.moduleId,
        classification: erpDocuments.classification,
        retentionClass: erpDocuments.retentionClass,
        scanStatus: erpDocuments.scanStatus,
        metadata: erpDocuments.metadata,
      })
      .from(erpDocuments)
      .where(
        and(
          eq(erpDocuments.organizationId, input.organizationId),
          eq(erpDocuments.id, input.documentId),
          eq(erpDocuments.moduleId, input.moduleId),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  });
}

export async function getOrganizationDocumentStorageBytes(input: {
  organizationId: string;
}): Promise<number> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [erpRows, hrRows] = await Promise.all([
      db
        .select({
          totalBytes: sum(erpDocuments.sizeBytes),
        })
        .from(erpDocuments)
        .where(eq(erpDocuments.organizationId, input.organizationId)),
      db
        .select({
          totalBytes: sum(hrEmployeeDocuments.sizeBytes),
        })
        .from(hrEmployeeDocuments)
        .where(
          and(
            eq(hrEmployeeDocuments.organizationId, input.organizationId),
            eq(hrEmployeeDocuments.isLatestActive, true),
            eq(hrEmployeeDocuments.lifecycleStatus, "active"),
          ),
        ),
    ]);

    return (
      Number(erpRows[0]?.totalBytes ?? 0) + Number(hrRows[0]?.totalBytes ?? 0)
    );
  });
}

export async function registerTenantDocument(input: {
  organizationId: string;
  moduleId: ErpModuleId;
  ownerEntityId?: string;
  title: string;
  blobUrl: string;
  pathname: string;
  contentType: string;
  sizeBytes: number;
  access: ErpDocumentAccess;
  /** ETag returned by Vercel Blob on upload. */
  blobEtag?: string | null;
  classification?: ErpDocumentClassification;
  /** Retention class per org data-handling policy (ARCH-1001). Defaults to 'standard'. */
  retentionClass?: ErpDocumentRetentionClass;
  /** Malware scan status — defaults to passed until AV pipeline ships. */
  scanStatus?: ErpDocumentScanStatus;
  uploadedByAuthUserId: string;
  metadata: Record<string, unknown>;
}) {
  return runWithOrganizationContext(input.organizationId, (db) =>
    db.transaction(async (tx) => {
      const documentId = createEntityId("doc");
      const existingDocument = await tx
        .select({ id: erpDocuments.id })
        .from(erpDocuments)
        .where(
          and(
            eq(erpDocuments.organizationId, input.organizationId),
            eq(erpDocuments.pathname, input.pathname),
          ),
        )
        .limit(1);

      if (existingDocument[0]) {
        return existingDocument[0].id;
      }

      await tx.insert(erpDocuments).values({
        id: documentId,
        organizationId: input.organizationId,
        moduleId: input.moduleId,
        ownerEntityId: input.ownerEntityId ?? null,
        title: input.title,
        blobUrl: input.blobUrl,
        pathname: input.pathname,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
        access: input.access,
        blobEtag: input.blobEtag ?? null,
        classification: input.classification ?? "internal",
        retentionClass: input.retentionClass ?? "standard",
        scanStatus: input.scanStatus ?? "pending",
        uploadedByAuthUserId: input.uploadedByAuthUserId,
        metadata: input.metadata,
      });

      await insertAuditLog(tx, {
        organizationId: input.organizationId,
        actorAuthUserId: input.uploadedByAuthUserId,
        entityType: "document",
        entityId: documentId,
        action: "document.register",
        summary: `Registered document ${input.title}.`,
        metadata: {
          moduleId: input.moduleId,
          pathname: input.pathname,
          contentType: input.contentType,
          sizeBytes: input.sizeBytes,
          access: input.access,
          blobEtag: input.blobEtag ?? null,
          classification: input.classification ?? "internal",
          retentionClass: input.retentionClass ?? "standard",
          scanStatus: input.scanStatus ?? "pending",
        },
      });

      return documentId;
    }),
  );
}

export async function updateTenantDocumentScanStatus(input: {
  organizationId: string;
  documentId: string;
  scanStatus: ErpDocumentScanStatus;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(erpDocuments)
      .set({
        scanStatus: input.scanStatus,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(erpDocuments.organizationId, input.organizationId),
          eq(erpDocuments.id, input.documentId),
        ),
      );
  });
}

export async function listTenantDocumentsByScanStatus(input: {
  organizationId: string;
  scanStatuses: readonly ErpDocumentScanStatus[];
  limit?: number;
  query?: TenantErpDocumentQuarantineWindowQuery;
}): Promise<TenantErpDocumentQuarantineWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = decodeWindowOffset(input.query?.cursor);
  const scanStatuses =
    input.scanStatuses.length > 0
      ? input.scanStatuses
      : (["failed", "quarantined"] as const);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const whereClause = and(
      eq(erpDocuments.organizationId, input.organizationId),
      inArray(erpDocuments.scanStatus, [...scanStatuses]),
    );
    const [rows, totalRows] = await Promise.all([
      db
        .select({
          id: erpDocuments.id,
          moduleId: erpDocuments.moduleId,
          title: erpDocuments.title,
          contentType: erpDocuments.contentType,
          sizeBytes: erpDocuments.sizeBytes,
          access: erpDocuments.access,
          blobEtag: erpDocuments.blobEtag,
          classification: erpDocuments.classification,
          retentionClass: erpDocuments.retentionClass,
          scanStatus: erpDocuments.scanStatus,
          createdAt: erpDocuments.createdAt,
        })
        .from(erpDocuments)
        .where(whereClause)
        .orderBy(desc(erpDocuments.updatedAt), desc(erpDocuments.createdAt))
        .limit(pageSize + 1)
        .offset(offset),
      db.select({ value: count() }).from(erpDocuments).where(whereClause),
    ]);
    const visibleRows = rows.slice(0, pageSize);
    const hasNextPage = rows.length > pageSize;
    const nextCursor = hasNextPage
      ? encodeWindowOffset(offset + pageSize)
      : undefined;

    return {
      rows: visibleRows,
      pageSize,
      totalCount: Number(totalRows[0]?.value ?? 0),
      hasNextPage,
      ...(nextCursor ? { nextCursor } : {}),
    };
  });
}

export async function listTenantDocumentsPendingScan(input: {
  organizationId: string;
  limit?: number;
  staleScanningBefore?: Date;
}) {
  const limit = Math.min(Math.max(input.limit ?? 100, 1), 500);
  const staleScanningBefore = input.staleScanningBefore ?? new Date();

  return runWithOrganizationContext(input.organizationId, async (db) => {
    return db
      .select({
        id: erpDocuments.id,
        moduleId: erpDocuments.moduleId,
        title: erpDocuments.title,
        pathname: erpDocuments.pathname,
        blobUrl: erpDocuments.blobUrl,
        contentType: erpDocuments.contentType,
        sizeBytes: erpDocuments.sizeBytes,
        scanStatus: erpDocuments.scanStatus,
        updatedAt: erpDocuments.updatedAt,
      })
      .from(erpDocuments)
      .where(
        and(
          eq(erpDocuments.organizationId, input.organizationId),
          or(
            eq(erpDocuments.scanStatus, "pending"),
            and(
              eq(erpDocuments.scanStatus, "scanning"),
              lte(erpDocuments.updatedAt, staleScanningBefore),
            ),
          ),
        ),
      )
      .orderBy(asc(erpDocuments.updatedAt))
      .limit(limit);
  });
}

/** Atomically marks a document as scanning — skips if another worker claimed it. */
export async function claimTenantDocumentForScan(input: {
  organizationId: string;
  documentId: string;
  staleScanningBefore?: Date;
}): Promise<boolean> {
  const staleScanningBefore = input.staleScanningBefore ?? new Date();

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .update(erpDocuments)
      .set({
        scanStatus: "scanning",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(erpDocuments.organizationId, input.organizationId),
          eq(erpDocuments.id, input.documentId),
          or(
            eq(erpDocuments.scanStatus, "pending"),
            and(
              eq(erpDocuments.scanStatus, "scanning"),
              lte(erpDocuments.updatedAt, staleScanningBefore),
            ),
          ),
        ),
      )
      .returning({ id: erpDocuments.id });

    return rows.length > 0;
  });
}

export class TenantDocumentMutationError extends Error {
  readonly code:
    | "not_found"
    | "legal_hold"
    | "not_on_legal_hold"
    | "scan_not_releasable";

  constructor(
    code:
      | "not_found"
      | "legal_hold"
      | "not_on_legal_hold"
      | "scan_not_releasable",
  ) {
    super(code);
    this.code = code;
  }
}

const SHORT_TERM_RETENTION_DAYS = 30;

export async function listTenantDocumentsPastRetentionExpiry(input: {
  organizationId: string;
  limit?: number;
  before?: Date;
}) {
  const limit = Math.min(Math.max(input.limit ?? 100, 1), 500);
  const before = input.before ?? new Date();
  const createdBefore = new Date(before);
  createdBefore.setUTCDate(
    createdBefore.getUTCDate() - SHORT_TERM_RETENTION_DAYS,
  );

  return runWithOrganizationContext(input.organizationId, async (db) => {
    return db
      .select({
        id: erpDocuments.id,
        moduleId: erpDocuments.moduleId,
        title: erpDocuments.title,
        retentionClass: erpDocuments.retentionClass,
        createdAt: erpDocuments.createdAt,
      })
      .from(erpDocuments)
      .where(
        and(
          eq(erpDocuments.organizationId, input.organizationId),
          eq(erpDocuments.retentionClass, "short-term"),
          lte(erpDocuments.createdAt, createdBefore),
        ),
      )
      .orderBy(asc(erpDocuments.createdAt))
      .limit(limit);
  });
}

export async function getTenantDocumentStorageRef(input: {
  organizationId: string;
  documentId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        id: erpDocuments.id,
        title: erpDocuments.title,
        moduleId: erpDocuments.moduleId,
        pathname: erpDocuments.pathname,
        blobUrl: erpDocuments.blobUrl,
        classification: erpDocuments.classification,
        retentionClass: erpDocuments.retentionClass,
        scanStatus: erpDocuments.scanStatus,
      })
      .from(erpDocuments)
      .where(
        and(
          eq(erpDocuments.organizationId, input.organizationId),
          eq(erpDocuments.id, input.documentId),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  });
}

export async function applyTenantDocumentLegalHold(input: {
  organizationId: string;
  documentId: string;
  actorAuthUserId: string;
}) {
  return runWithOrganizationContext(input.organizationId, (db) =>
    db.transaction(async (tx) => {
      const rows = await tx
        .select({
          id: erpDocuments.id,
          title: erpDocuments.title,
          retentionClass: erpDocuments.retentionClass,
        })
        .from(erpDocuments)
        .where(
          and(
            eq(erpDocuments.organizationId, input.organizationId),
            eq(erpDocuments.id, input.documentId),
          ),
        )
        .limit(1);

      const document = rows[0];
      if (!document) {
        throw new TenantDocumentMutationError("not_found");
      }

      if (document.retentionClass === "legal-hold") {
        return document;
      }

      await tx
        .update(erpDocuments)
        .set({ retentionClass: "legal-hold" })
        .where(
          and(
            eq(erpDocuments.organizationId, input.organizationId),
            eq(erpDocuments.id, input.documentId),
          ),
        );

      await insertAuditLog(tx, {
        organizationId: input.organizationId,
        actorAuthUserId: input.actorAuthUserId,
        entityType: "document",
        entityId: document.id,
        action: "document.legal-hold",
        summary: `Applied legal hold to document ${document.title}.`,
        metadata: {
          previousRetentionClass: document.retentionClass,
          retentionClass: "legal-hold",
        },
      });

      return document;
    }),
  );
}

function parseAuditMetadataPreviousRetentionClass(
  metadata: Record<string, unknown> | string | null | undefined,
): string | undefined {
  if (!metadata) {
    return undefined;
  }

  if (typeof metadata === "object") {
    const previousRetentionClass = metadata.previousRetentionClass;
    return typeof previousRetentionClass === "string"
      ? previousRetentionClass
      : undefined;
  }

  try {
    const parsed = JSON.parse(metadata) as { previousRetentionClass?: string };
    return typeof parsed.previousRetentionClass === "string"
      ? parsed.previousRetentionClass
      : undefined;
  } catch {
    return undefined;
  }
}

export async function releaseTenantDocumentLegalHold(input: {
  organizationId: string;
  documentId: string;
  actorAuthUserId: string;
}) {
  return runWithOrganizationContext(input.organizationId, (db) =>
    db.transaction(async (tx) => {
      const rows = await tx
        .select({
          id: erpDocuments.id,
          title: erpDocuments.title,
          retentionClass: erpDocuments.retentionClass,
        })
        .from(erpDocuments)
        .where(
          and(
            eq(erpDocuments.organizationId, input.organizationId),
            eq(erpDocuments.id, input.documentId),
          ),
        )
        .limit(1);

      const document = rows[0];
      if (!document) {
        throw new TenantDocumentMutationError("not_found");
      }

      if (!isErpDocumentRowOnLegalHold(document.retentionClass)) {
        throw new TenantDocumentMutationError("not_on_legal_hold");
      }

      const holdAuditRows = await tx
        .select({ metadata: auditLogs.metadata })
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.organizationId, input.organizationId),
            eq(auditLogs.entityId, input.documentId),
            eq(auditLogs.action, "document.legal-hold"),
          ),
        )
        .orderBy(desc(auditLogs.createdAt))
        .limit(1);

      const restoredRetentionClass: ErpDocumentRetentionClass =
        (parseAuditMetadataPreviousRetentionClass(holdAuditRows[0]?.metadata) ??
          "standard") as ErpDocumentRetentionClass;

      await tx
        .update(erpDocuments)
        .set({
          retentionClass: restoredRetentionClass,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(erpDocuments.organizationId, input.organizationId),
            eq(erpDocuments.id, input.documentId),
          ),
        );

      await insertAuditLog(tx, {
        organizationId: input.organizationId,
        actorAuthUserId: input.actorAuthUserId,
        entityType: "document",
        entityId: document.id,
        action: "document.legal-hold-released",
        summary: `Released legal hold on document ${document.title}.`,
        metadata: {
          previousRetentionClass: "legal-hold",
          retentionClass: restoredRetentionClass,
        },
      });

      return {
        id: document.id,
        title: document.title,
        retentionClass: restoredRetentionClass,
      };
    }),
  );
}

const SCAN_QUARANTINE_STATUSES = new Set<ErpDocumentScanStatus>([
  "failed",
  "quarantined",
]);

export async function releaseTenantDocumentFromScanQuarantine(input: {
  organizationId: string;
  documentId: string;
  actorAuthUserId: string;
}) {
  return runWithOrganizationContext(input.organizationId, (db) =>
    db.transaction(async (tx) => {
      const rows = await tx
        .select({
          id: erpDocuments.id,
          title: erpDocuments.title,
          moduleId: erpDocuments.moduleId,
          pathname: erpDocuments.pathname,
          classification: erpDocuments.classification,
          retentionClass: erpDocuments.retentionClass,
          scanStatus: erpDocuments.scanStatus,
        })
        .from(erpDocuments)
        .where(
          and(
            eq(erpDocuments.organizationId, input.organizationId),
            eq(erpDocuments.id, input.documentId),
          ),
        )
        .limit(1);

      const document = rows[0];
      if (!document) {
        throw new TenantDocumentMutationError("not_found");
      }

      if (!SCAN_QUARANTINE_STATUSES.has(document.scanStatus)) {
        throw new TenantDocumentMutationError("scan_not_releasable");
      }

      await tx
        .update(erpDocuments)
        .set({
          scanStatus: "passed",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(erpDocuments.organizationId, input.organizationId),
            eq(erpDocuments.id, input.documentId),
          ),
        );

      await insertAuditLog(tx, {
        organizationId: input.organizationId,
        actorAuthUserId: input.actorAuthUserId,
        entityType: "document",
        entityId: document.id,
        action: "document.scan-released",
        summary: `Operator released document ${document.title} from scan quarantine.`,
        metadata: {
          previousScanStatus: document.scanStatus,
          scanStatus: "passed",
        },
      });

      return {
        id: document.id,
        title: document.title,
        moduleId: document.moduleId,
        pathname: document.pathname,
        classification: document.classification,
        retentionClass: document.retentionClass,
        previousScanStatus: document.scanStatus,
      };
    }),
  );
}

export async function deleteTenantDocument(input: {
  organizationId: string;
  documentId: string;
  actorAuthUserId: string;
}) {
  return runWithOrganizationContext(input.organizationId, (db) =>
    db.transaction(async (tx) => {
      const rows = await tx
        .select({
          id: erpDocuments.id,
          title: erpDocuments.title,
          moduleId: erpDocuments.moduleId,
          pathname: erpDocuments.pathname,
          classification: erpDocuments.classification,
          retentionClass: erpDocuments.retentionClass,
          scanStatus: erpDocuments.scanStatus,
        })
        .from(erpDocuments)
        .where(
          and(
            eq(erpDocuments.organizationId, input.organizationId),
            eq(erpDocuments.id, input.documentId),
          ),
        )
        .limit(1);

      const document = rows[0];
      if (!document) {
        throw new TenantDocumentMutationError("not_found");
      }

      if (isErpDocumentRowOnLegalHold(document.retentionClass)) {
        throw new TenantDocumentMutationError("legal_hold");
      }

      if (await isOrganizationDocumentLegalHoldActive(input.organizationId)) {
        throw new TenantDocumentMutationError("legal_hold");
      }

      await tx
        .delete(erpDocuments)
        .where(
          and(
            eq(erpDocuments.organizationId, input.organizationId),
            eq(erpDocuments.id, input.documentId),
          ),
        );

      await insertAuditLog(tx, {
        organizationId: input.organizationId,
        actorAuthUserId: input.actorAuthUserId,
        entityType: "document",
        entityId: document.id,
        action: "document.delete",
        summary: `Deleted document ${document.title}.`,
        metadata: {
          moduleId: document.moduleId,
          pathname: document.pathname,
          classification: document.classification,
          retentionClass: document.retentionClass,
          scanStatus: document.scanStatus,
        },
      });

      return document;
    }),
  );
}

export async function listOrganizationsForCoreErpSeed() {
  const db = getDb();

  return db
    .select({
      id: organizations.id,
      ownerAuthUserId: organizations.ownerAuthUserId,
    })
    .from(organizations)
    .orderBy(asc(organizations.name));
}

export async function seedCoreErpModuleData(input: {
  organizationId: string;
  actorAuthUserId: string;
}) {
  const seedRecords = moduleSeedRecords.filter(
    (record) => record.moduleId !== "system-admin",
  );

  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .insert(erpModuleRecords)
      .values(
        seedRecords.map((record) => ({
          id: createEntityId("erp"),
          organizationId: input.organizationId,
          moduleId: record.moduleId,
          recordType: record.recordType,
          reference: record.reference,
          title: record.title,
          status: record.status,
          owner: record.owner,
          amountCents: record.amountCents,
          dueAt: addDays(record.dueInDays),
          createdByAuthUserId: input.actorAuthUserId,
          updatedByAuthUserId: input.actorAuthUserId,
          metadata: record.metadata,
        })),
      )
      .onConflictDoNothing();

    await db
      .insert(erpWorkItems)
      .values(
        moduleSeedWorkItems.map((item) => ({
          id: createEntityId("work"),
          organizationId: input.organizationId,
          moduleId: item.moduleId,
          subject: item.subject,
          owner: item.owner,
          status: item.status,
          priority: item.priority,
          dueAt: addDays(item.dueInDays),
          createdByAuthUserId: input.actorAuthUserId,
          updatedByAuthUserId: input.actorAuthUserId,
          metadata: item.metadata,
        })),
      )
      .onConflictDoNothing();

    await db
      .insert(erpSavedViews)
      .values(
        moduleSeedViews.map((view) => ({
          id: createEntityId("view"),
          organizationId: input.organizationId,
          moduleId: view.moduleId,
          name: view.name,
          description: view.description,
          visibility: view.visibility,
          filter: view.filter,
          createdByAuthUserId: input.actorAuthUserId,
          updatedByAuthUserId: input.actorAuthUserId,
        })),
      )
      .onConflictDoNothing();
  });
}

export type TenantModuleMetricSummary = {
  recordCount: number;
  blockedRecordCount: number;
  activeRecordCount: number;
  dueSoonRecordCount: number;
  dueAmountCents: number;
  workItemCount: number;
  pendingWorkItemCount: number;
  escalatedWorkItemCount: number;
  highPriorityWorkItemCount: number;
  documentCount: number;
  modulesWithData: number;
  moduleCapacity: number;
};

const pendingWorkItemStatuses = ["pending", "in-review"] as const;

function readCount(rows: { count: number | null | undefined }[]) {
  return Number(rows[0]?.count ?? 0);
}

function readSum(rows: { total: string | number | null | undefined }[]) {
  return Number(rows[0]?.total ?? 0);
}

function dueSoonWindow() {
  const now = new Date();
  const upperBound = addDays(7);

  return { now, upperBound };
}

async function summarizeScopedMetrics(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    moduleId?: ErpModuleId;
    moduleCapacity: number;
  },
): Promise<TenantModuleMetricSummary> {
  const { now, upperBound } = dueSoonWindow();
  const recordScope = [
    eq(erpModuleRecords.organizationId, input.organizationId),
  ];

  if (input.moduleId) {
    recordScope.push(eq(erpModuleRecords.moduleId, input.moduleId));
  }

  const workItemScope = [eq(erpWorkItems.organizationId, input.organizationId)];

  if (input.moduleId) {
    workItemScope.push(eq(erpWorkItems.moduleId, input.moduleId));
  }

  const documentScope = [eq(erpDocuments.organizationId, input.organizationId)];

  if (input.moduleId) {
    documentScope.push(eq(erpDocuments.moduleId, input.moduleId));
  }

  const [
    recordCount,
    blockedRecordCount,
    activeRecordCount,
    dueSoonRecordCount,
    dueAmountCents,
    workItemCount,
    pendingWorkItemCount,
    escalatedWorkItemCount,
    highPriorityWorkItemCount,
    documentCount,
    modulesWithData,
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(erpModuleRecords)
      .where(and(...recordScope)),
    db
      .select({ count: count() })
      .from(erpModuleRecords)
      .where(and(...recordScope, eq(erpModuleRecords.status, "blocked"))),
    db
      .select({ count: count() })
      .from(erpModuleRecords)
      .where(and(...recordScope, eq(erpModuleRecords.status, "active"))),
    db
      .select({ count: count() })
      .from(erpModuleRecords)
      .where(
        and(
          ...recordScope,
          eq(erpModuleRecords.status, "active"),
          gte(erpModuleRecords.dueAt, now),
          lte(erpModuleRecords.dueAt, upperBound),
        ),
      ),
    db
      .select({
        total: sum(erpModuleRecords.amountCents),
      })
      .from(erpModuleRecords)
      .where(
        and(
          ...recordScope,
          eq(erpModuleRecords.status, "active"),
          gte(erpModuleRecords.dueAt, now),
          lte(erpModuleRecords.dueAt, upperBound),
        ),
      ),
    db
      .select({ count: count() })
      .from(erpWorkItems)
      .where(and(...workItemScope)),
    db
      .select({ count: count() })
      .from(erpWorkItems)
      .where(
        and(
          ...workItemScope,
          inArray(erpWorkItems.status, [...pendingWorkItemStatuses]),
        ),
      ),
    db
      .select({ count: count() })
      .from(erpWorkItems)
      .where(and(...workItemScope, eq(erpWorkItems.status, "escalated"))),
    db
      .select({ count: count() })
      .from(erpWorkItems)
      .where(and(...workItemScope, eq(erpWorkItems.priority, "high"))),
    db
      .select({ count: count() })
      .from(erpDocuments)
      .where(and(...documentScope)),
    input.moduleId
      ? Promise.resolve(null)
      : Promise.all([
          db
            .selectDistinct({ moduleId: erpModuleRecords.moduleId })
            .from(erpModuleRecords)
            .where(eq(erpModuleRecords.organizationId, input.organizationId)),
          db
            .selectDistinct({ moduleId: erpWorkItems.moduleId })
            .from(erpWorkItems)
            .where(eq(erpWorkItems.organizationId, input.organizationId)),
        ]),
  ]);

  const resolvedRecordCount = readCount(recordCount);
  const resolvedWorkItemCount = readCount(workItemCount);
  const resolvedModulesWithData = input.moduleId
    ? resolvedRecordCount > 0 || resolvedWorkItemCount > 0
      ? 1
      : 0
    : (() => {
        if (!modulesWithData || !Array.isArray(modulesWithData)) {
          return 0;
        }

        const [recordModules, workModules] = modulesWithData as [
          { moduleId: ErpModuleId }[],
          { moduleId: ErpModuleId }[],
        ];
        const moduleSet = new Set<ErpModuleId>();

        for (const row of recordModules) {
          if (row.moduleId !== "dashboard") {
            moduleSet.add(row.moduleId);
          }
        }

        for (const row of workModules) {
          if (row.moduleId !== "dashboard") {
            moduleSet.add(row.moduleId);
          }
        }

        return moduleSet.size;
      })();

  return {
    recordCount: resolvedRecordCount,
    blockedRecordCount: readCount(blockedRecordCount),
    activeRecordCount: readCount(activeRecordCount),
    dueSoonRecordCount: readCount(dueSoonRecordCount),
    dueAmountCents: readSum(dueAmountCents),
    workItemCount: resolvedWorkItemCount,
    pendingWorkItemCount: readCount(pendingWorkItemCount),
    escalatedWorkItemCount: readCount(escalatedWorkItemCount),
    highPriorityWorkItemCount: readCount(highPriorityWorkItemCount),
    documentCount: readCount(documentCount),
    modulesWithData: resolvedModulesWithData,
    moduleCapacity: input.moduleCapacity,
  };
}

export async function summarizeTenantModuleMetrics(input: {
  organizationId: string;
  moduleId: ErpModuleId;
}): Promise<TenantModuleMetricSummary> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    return summarizeScopedMetrics(db, {
      organizationId: input.organizationId,
      moduleId: input.moduleId,
      moduleCapacity: 1,
    });
  });
}

export async function summarizeTenantOrganizationMetrics(input: {
  organizationId: string;
}): Promise<TenantModuleMetricSummary> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    return summarizeScopedMetrics(db, {
      organizationId: input.organizationId,
      moduleCapacity: coreModuleIds.length,
    });
  });
}
