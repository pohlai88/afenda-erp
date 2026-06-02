import {
  erpPriorities,
  erpRecordStatuses,
  erpWorkItemStatuses,
  type ErpPriority,
  type ErpRecordStatus,
  type ErpWorkItemStatus,
  type TenantErpRecordSort,
  type TenantErpRecordWindowQuery,
  type TenantErpWorkItemSort,
  type TenantErpWorkItemWindowQuery,
  type TenantErpDocumentWindowQuery,
} from "@afenda/db";

const recordSorts = [
  "due-asc",
  "updated-desc",
  "reference-asc",
] as const satisfies readonly TenantErpRecordSort[];

const workItemSorts = [
  "due-asc",
  "updated-desc",
  "priority-desc",
] as const satisfies readonly TenantErpWorkItemSort[];

export type ModuleWorkspaceSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type ModuleWorkspaceListQuery = {
  recordsCursor?: string;
  recordsSort?: TenantErpRecordSort;
  recordsStatus?: ErpRecordStatus;
  recordsRecordType?: string;
  workItemsCursor?: string;
  workItemsSort?: TenantErpWorkItemSort;
  workItemsStatus?: ErpWorkItemStatus;
  workItemsPriority?: ErpPriority;
  documentsCursor?: string;
  documentActivityCursor?: string;
};

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function pickAllowed<const T extends readonly string[]>(
  value: string | undefined,
  allowed: T,
): T[number] | undefined {
  return value && (allowed as readonly string[]).includes(value)
    ? (value as T[number])
    : undefined;
}

export function resolveModuleWorkspaceListQuery(
  searchParams: ModuleWorkspaceSearchParams = {},
): ModuleWorkspaceListQuery {
  const recordsRecordType = firstParam(searchParams.recordsRecordType);

  return {
    recordsCursor: firstParam(searchParams.recordsCursor),
    recordsSort: pickAllowed(firstParam(searchParams.recordsSort), recordSorts),
    recordsStatus: pickAllowed(
      firstParam(searchParams.recordsStatus),
      erpRecordStatuses,
    ),
    ...(recordsRecordType ? { recordsRecordType } : {}),
    workItemsCursor: firstParam(searchParams.workItemsCursor),
    workItemsSort: pickAllowed(
      firstParam(searchParams.workItemsSort),
      workItemSorts,
    ),
    workItemsStatus: pickAllowed(
      firstParam(searchParams.workItemsStatus),
      erpWorkItemStatuses,
    ),
    workItemsPriority: pickAllowed(
      firstParam(searchParams.workItemsPriority),
      erpPriorities,
    ),
    documentsCursor: firstParam(searchParams.documentsCursor),
    documentActivityCursor: firstParam(searchParams.documentActivityCursor),
  };
}

export function toRecordWindowQuery(
  query: ModuleWorkspaceListQuery | undefined,
): TenantErpRecordWindowQuery | undefined {
  if (!query) {
    return undefined;
  }

  return {
    cursor: query.recordsCursor,
    sort: query.recordsSort,
    status: query.recordsStatus,
    recordType: query.recordsRecordType,
  };
}

export function toDocumentWindowQuery(
  query: ModuleWorkspaceListQuery | undefined,
): TenantErpDocumentWindowQuery | undefined {
  if (!query) {
    return undefined;
  }

  return {
    cursor: query.documentsCursor,
  };
}

export function toDocumentActivityWindowQuery(
  query: ModuleWorkspaceListQuery | undefined,
): import("@afenda/db").TenantDocumentEvidenceWindowQuery | undefined {
  if (!query) {
    return undefined;
  }

  return {
    cursor: query.documentActivityCursor,
  };
}

export function toWorkItemWindowQuery(
  query: ModuleWorkspaceListQuery | undefined,
): TenantErpWorkItemWindowQuery | undefined {
  if (!query) {
    return undefined;
  }

  return {
    cursor: query.workItemsCursor,
    sort: query.workItemsSort,
    status: query.workItemsStatus,
    priority: query.workItemsPriority,
  };
}
