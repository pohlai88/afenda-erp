import type { HrExpenseClaimRecord } from "../schemas/hr.payroll.expense-claim.schema";

export type HrExpenseAuditEvent = {
  id: string;
  organizationId: string;
  claimId: string;
  claimReference: string;
  action: string;
  actorUserId: string;
  detail: string;
  createdAt: string;
};

export type HrExpenseReportRow = {
  id: string;
  organizationId: string;
  periodLabel: string;
  department: string;
  category: string;
  status: string;
  claimCount: number;
  totalAmount: string;
  currencyCode: string;
};

type OrgExpenseStore = {
  claims: Map<string, HrExpenseClaimRecord>;
  audit: HrExpenseAuditEvent[];
  claimSequence: number;
};

const stores = new Map<string, OrgExpenseStore>();

function getOrgStore(organizationId: string): OrgExpenseStore {
  let store = stores.get(organizationId);
  if (!store) {
    store = {
      claims: new Map(),
      audit: [],
      claimSequence: 0,
    };
    stores.set(organizationId, store);
  }
  return store;
}

export function seedHrExpenseDemoClaims(organizationId: string, actorUserId: string) {
  const store = getOrgStore(organizationId);
  if (store.claims.size > 0) {
    return;
  }

  const now = new Date().toISOString();
  const samples: Array<Omit<HrExpenseClaimRecord, "id" | "organizationId" | "claimReference">> =
    [
      {
        expenseDate: "2026-05-12",
        category: "transport",
        amount: 84.5,
        currencyCode: "MYR",
        description: "Client site taxi — receipt attached",
        receiptReference: "receipt://demo/taxi-may12.pdf",
        status: "under_review",
        employeeId: actorUserId,
        employeeDisplayName: "Demo Operator",
        employeeNumber: "EMP-001",
        submittedAt: now,
        reimbursableAmount: 84.5,
        approvedAmount: 0,
        rejectedAmount: 0,
        duplicateFlag: false,
        exceptionRequired: false,
        lineItems: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        expenseDate: "2026-05-08",
        category: "meals",
        amount: 220,
        currencyCode: "MYR",
        description: "Team lunch — over daily limit",
        receiptReference: undefined,
        status: "submitted",
        employeeId: actorUserId,
        employeeDisplayName: "Demo Operator",
        employeeNumber: "EMP-001",
        submittedAt: now,
        reimbursableAmount: 0,
        approvedAmount: 0,
        rejectedAmount: 0,
        duplicateFlag: false,
        exceptionRequired: true,
        lineItems: [],
        createdAt: now,
        updatedAt: now,
      },
    ];

  for (const sample of samples) {
    store.claimSequence += 1;
    const id = `exp-${organizationId}-${store.claimSequence}`;
    const claim: HrExpenseClaimRecord = {
      ...sample,
      id,
      organizationId,
      claimReference: `EXP-${String(store.claimSequence).padStart(5, "0")}`,
    };
    store.claims.set(id, claim);
  }
}

export function listHrExpenseClaimsForOrg(organizationId: string): HrExpenseClaimRecord[] {
  seedHrExpenseDemoClaims(organizationId, "user_demo_owner");
  return [...getOrgStore(organizationId).claims.values()].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

export function getHrExpenseClaimById(
  organizationId: string,
  claimId: string,
): HrExpenseClaimRecord | undefined {
  return getOrgStore(organizationId).claims.get(claimId);
}

export function upsertHrExpenseClaim(
  claim: HrExpenseClaimRecord,
): HrExpenseClaimRecord {
  const store = getOrgStore(claim.organizationId);
  store.claims.set(claim.id, claim);
  return claim;
}

export function appendHrExpenseAuditEvent(input: Omit<HrExpenseAuditEvent, "id">) {
  const store = getOrgStore(input.organizationId);
  const event: HrExpenseAuditEvent = {
    ...input,
    id: `exp-audit-${store.audit.length + 1}-${Date.now()}`,
  };
  store.audit.unshift(event);
  return event;
}

export function listHrExpenseAuditEvents(organizationId: string): HrExpenseAuditEvent[] {
  seedHrExpenseDemoClaims(organizationId, "user_demo_owner");
  return [...getOrgStore(organizationId).audit];
}

export function buildHrExpenseReportRows(
  organizationId: string,
): HrExpenseReportRow[] {
  const claims = listHrExpenseClaimsForOrg(organizationId);
  const buckets = new Map<string, HrExpenseReportRow>();

  for (const claim of claims) {
    const key = `${claim.category}|${claim.status}|Finance`;
    const existing = buckets.get(key);
    const amount = claim.reimbursableAmount > 0 ? claim.reimbursableAmount : claim.amount;
    if (existing) {
      existing.claimCount += 1;
      const total = Number.parseFloat(existing.totalAmount) + amount;
      existing.totalAmount = total.toFixed(2);
      continue;
    }
    buckets.set(key, {
      id: key,
      organizationId,
      periodLabel: claim.expenseDate.slice(0, 7),
      department: "Finance",
      category: claim.category,
      status: claim.status,
      claimCount: 1,
      totalAmount: amount.toFixed(2),
      currencyCode: claim.currencyCode,
    });
  }

  return [...buckets.values()].sort((left, right) =>
    right.periodLabel.localeCompare(left.periodLabel),
  );
}

/** HRM-EXP-009 — naive duplicate detection for demo store. */
export function detectDuplicateExpenseClaim(input: {
  organizationId: string;
  expenseDate: string;
  amount: number;
  category: string;
  description: string;
  excludeClaimId?: string;
}): boolean {
  const claims = listHrExpenseClaimsForOrg(input.organizationId);
  return claims.some(
    (claim) =>
      claim.id !== input.excludeClaimId &&
      claim.expenseDate === input.expenseDate &&
      claim.amount === input.amount &&
      claim.category === input.category &&
      claim.description.trim().toLowerCase() === input.description.trim().toLowerCase(),
  );
}

export function nextHrExpenseClaimReference(organizationId: string): string {
  const store = getOrgStore(organizationId);
  store.claimSequence += 1;
  return `EXP-${String(store.claimSequence).padStart(5, "0")}`;
}
