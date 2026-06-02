import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  erpDocumentAccessEnum,
  erpDocumentClassificationEnum,
  erpDocumentRetentionEnum,
  erpDocumentScanStatusEnum,
  erpModuleIdEnum,
  erpPriorityEnum,
  erpRecordStatusEnum,
  erpViewVisibilityEnum,
  erpWorkItemStatusEnum,
  organizationIdColumn,
  timestampColumns,
} from "./common";
import { organizations } from "./organizations";

const organizationReference = () =>
  organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
  });

export const erpModuleRecords = pgTable(
  "erp_module_records",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    moduleId: erpModuleIdEnum("module_id").notNull(),
    recordType: text("record_type").notNull(),
    reference: text("reference").notNull(),
    title: text("title").notNull(),
    status: erpRecordStatusEnum("status").notNull(),
    owner: text("owner").notNull(),
    amountCents: integer("amount_cents"),
    currency: text("currency").notNull().default("MYR"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    createdByAuthUserId: text("created_by_auth_user_id").notNull(),
    updatedByAuthUserId: text("updated_by_auth_user_id").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("erp_module_records_org_module_ref_idx").on(
      table.organizationId,
      table.moduleId,
      table.reference,
    ),
    index("erp_module_records_org_module_status_idx").on(
      table.organizationId,
      table.moduleId,
      table.status,
    ),
  ],
);

export const erpSavedViews = pgTable(
  "erp_saved_views",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    moduleId: erpModuleIdEnum("module_id").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    visibility: erpViewVisibilityEnum("visibility").notNull(),
    filter: jsonb("filter").$type<Record<string, unknown>>().notNull(),
    createdByAuthUserId: text("created_by_auth_user_id").notNull(),
    updatedByAuthUserId: text("updated_by_auth_user_id").notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("erp_saved_views_org_module_name_idx").on(
      table.organizationId,
      table.moduleId,
      table.name,
    ),
    index("erp_saved_views_org_module_idx").on(
      table.organizationId,
      table.moduleId,
    ),
  ],
);

export const erpWorkItems = pgTable(
  "erp_work_items",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    moduleId: erpModuleIdEnum("module_id").notNull(),
    subject: text("subject").notNull(),
    owner: text("owner").notNull(),
    status: erpWorkItemStatusEnum("status").notNull(),
    priority: erpPriorityEnum("priority").notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    sourceRecordId: text("source_record_id").references(
      () => erpModuleRecords.id,
      { onDelete: "set null" },
    ),
    createdByAuthUserId: text("created_by_auth_user_id").notNull(),
    updatedByAuthUserId: text("updated_by_auth_user_id").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("erp_work_items_org_module_subject_idx").on(
      table.organizationId,
      table.moduleId,
      table.subject,
    ),
    index("erp_work_items_org_module_status_idx").on(
      table.organizationId,
      table.moduleId,
      table.status,
    ),
    index("erp_work_items_due_idx").on(table.dueAt),
  ],
);

export const erpDocuments = pgTable(
  "erp_documents",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    moduleId: erpModuleIdEnum("module_id").notNull(),
    ownerEntityId: text("owner_entity_id"),
    title: text("title").notNull(),
    blobUrl: text("blob_url").notNull(),
    pathname: text("pathname").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    access: erpDocumentAccessEnum("access").notNull(),
    /** ETag returned by Vercel Blob on upload — the store's content integrity identifier. */
    blobEtag: text("blob_etag"),
    /** Data-handling retention class (ARCH-1001 §Files). */
    retentionClass: erpDocumentRetentionEnum("retention_class")
      .notNull()
      .default("standard"),
    /** Platform classification for download governance (ARCH-OS-1001 §5). */
    classification: erpDocumentClassificationEnum("classification")
      .notNull()
      .default("internal"),
    /** Malware scan gate — pending until scan pipeline marks passed (ARCH-OS-001). */
    scanStatus: erpDocumentScanStatusEnum("scan_status")
      .notNull()
      .default("pending"),
    uploadedByAuthUserId: text("uploaded_by_auth_user_id").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("erp_documents_org_pathname_idx").on(
      table.organizationId,
      table.pathname,
    ),
    index("erp_documents_org_module_idx").on(
      table.organizationId,
      table.moduleId,
    ),
    index("erp_documents_owner_entity_idx").on(table.ownerEntityId),
    index("erp_documents_org_scan_status_idx").on(
      table.organizationId,
      table.scanStatus,
    ),
  ],
);
