import type {
  __IDENTIFIER__RecordInput,
} from "../schemas/__DOMAIN_KEY__.schema";

export type __IDENTIFIER__AuditEvent = {
  readonly id: string;
  readonly organizationId: string;
  readonly action: string;
  readonly actorId: string;
  readonly targetId: string;
  readonly summary: string;
  readonly occurredAt: string;
};

export type __IDENTIFIER__Store = {
  records: __IDENTIFIER__RecordInput[];
  auditEvents: __IDENTIFIER__AuditEvent[];
};

const stores = new Map<string, __IDENTIFIER__Store>();

function withOrg<T extends { organizationId: string }>(
  organizationId: string,
  rows: readonly Omit<T, "organizationId">[],
): T[] {
  return rows.map((row) => ({ ...row, organizationId }) as T);
}

function createSeedStore(organizationId: string): __IDENTIFIER__Store {
  const records = withOrg<__IDENTIFIER__RecordInput>(organizationId, [
    {
      id: "__DOMAIN_LAST__-record-1",
      name: "__CAPABILITY_TITLE__ readiness record",
      owner: "HR Operations",
      status: "draft",
      updatedAt: "2026-06-01T00:00:00.000Z",
    },
  ]);

  const auditEvents = withOrg<__IDENTIFIER__AuditEvent>(organizationId, [
    {
      id: "__DOMAIN_LAST__-audit-1",
      action: "__DOMAIN_KEY__.record.seeded",
      actorId: "system",
      targetId: "__DOMAIN_LAST__-record-1",
      summary: "__CAPABILITY_TITLE__ scaffold seed record created.",
      occurredAt: "2026-06-01T00:00:00.000Z",
    },
  ]);

  return { records, auditEvents };
}

export function get__IDENTIFIER__Store(
  organizationId: string,
): __IDENTIFIER__Store {
  const existing = stores.get(organizationId);
  if (existing) return existing;
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function reset__IDENTIFIER__Store(
  organizationId: string,
): __IDENTIFIER__Store {
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}
