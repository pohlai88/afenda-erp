import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  appendAudit: vi.fn().mockResolvedValue({ auditEventId: "audit-1" }),
  insertHistory: vi.fn().mockResolvedValue({ eventId: "hr_cpm_hist_test" }),
  createId: vi.fn().mockImplementation((prefix: string) => `${prefix}_mock_id`),
  listPayrollRefs: vi.fn(),
  markPayrollSynced: vi.fn(),
  runWithOrg: vi.fn(
    async (_orgId: string, fn: (db: unknown) => Promise<unknown>) => fn({}),
  ),
}));

vi.mock("../../../../db/src/hr-compensation-planning-audit", () => ({
  appendHrCompensationAuditEventInTx: mocks.appendAudit,
}));

vi.mock("../../../../db/src/hr-employee-records-commands", () => ({
  insertHrEmployeeRecordEventInTx: mocks.insertHistory,
}));

vi.mock("../../../../db/src/ids", () => ({
  createEntityId: mocks.createId,
}));

vi.mock("@afenda/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...actual,
    listHrCompensationPayrollRefs: mocks.listPayrollRefs,
    markHrCompensationPayrollRefsSyncedInTx: mocks.markPayrollSynced,
    runWithOrganizationContext: mocks.runWithOrg,
  };
});

import { finalizeHrCompensationApprovalInTx } from "../../../../db/src/hr-compensation-planning";
import { hrPayrollCpmAuditActions } from "../../src/payroll-compensation/compensation-planning-modeling/hr.payroll.cpm.event";
import {
  acknowledgeCompensationPayrollSync,
  listApprovedCompensationPayrollRefs,
} from "../../src/payroll-compensation/_integration/payroll-compensation-changes.server";

type MockRec = {
  id: string;
  organizationId: string;
  cycleId: string;
  employeeId: string;
  adjustmentType: "merit";
  recommendationStatus: string;
  lockedAt: Date | null;
  currentSalary: string;
  proposedSalary: string;
};

function buildMockTx(state: {
  recommendation: MockRec;
  existingSalaryChange?: {
    id: string;
    employeeHistoryEventId: string;
  } | null;
  existingPayrollRef?: { id: string } | null;
}) {
  let selectPass = 0;
  const inserts: { values: Record<string, unknown> }[] = [];

  const db = {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => {
            selectPass += 1;
            if (selectPass === 1 && state.existingSalaryChange) {
              return [state.existingSalaryChange];
            }
            if (selectPass === 1) {
              return [];
            }
            if (selectPass === 2 && state.existingSalaryChange) {
              return state.existingPayrollRef ? [state.existingPayrollRef] : [];
            }
            if (selectPass === 2 || selectPass === 3) {
              return [state.recommendation];
            }
            return [];
          },
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: async () => undefined,
      }),
    }),
    insert: () => ({
      values: async (values: Record<string, unknown>) => {
        inserts.push({ values });
      },
    }),
  };

  return { db: db as never, inserts };
}

describe("finalizeHrCompensationApprovalInTx (CPM-026..028)", () => {
  const recommendation: MockRec = {
    id: "hr_cpm_rec_test",
    organizationId: "org-1",
    cycleId: "hr_cpm_cycle_test",
    employeeId: "hr_emp_test",
    adjustmentType: "merit",
    recommendationStatus: "pending_approval",
    lockedAt: null,
    currentSalary: "50000.00",
    proposedSalary: "55000.00",
  };

  beforeEach(() => {
    mocks.appendAudit.mockClear();
    mocks.insertHistory.mockClear();
    mocks.createId.mockClear();
  });

  it("creates salary change, employee history event, payroll ref, and audit events", async () => {
    const { db, inserts } = buildMockTx({ recommendation });

    const result = await finalizeHrCompensationApprovalInTx(db, {
      organizationId: "org-1",
      actorUserId: "user-1",
      recommendationId: recommendation.id,
      effectiveDate: new Date("2026-07-01T00:00:00.000Z"),
    });

    expect(result.salaryChangeId).toBe("hr_cpm_sal_mock_id");
    expect(result.payrollRefId).toBe("hr_cpm_pay_mock_id");
    expect(result.historyEventId).toBe("hr_cpm_hist_mock_id");

    expect(mocks.insertHistory).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        eventId: "hr_cpm_hist_mock_id",
        employeeId: "hr_emp_test",
        kind: "updated",
        fieldName: "base_salary",
        previousValue: "50000.00",
        newValue: "55000.00",
        approvalReference: recommendation.id,
      }),
    );

    const salaryInsert = inserts.find((row) => row.values.id === "hr_cpm_sal_mock_id");
    expect(salaryInsert?.values).toMatchObject({
      effectiveDate: new Date("2026-07-01T00:00:00.000Z"),
      employeeHistoryEventId: "hr_cpm_hist_mock_id",
      previousSalary: "50000.00",
      newSalary: "55000.00",
    });

    const payrollInsert = inserts.find((row) => row.values.id === "hr_cpm_pay_mock_id");
    expect(payrollInsert?.values).toMatchObject({
      payrollReferenceCode: "CPM-rec_test",
      amountDelta: "5000.00",
    });

    expect(mocks.appendAudit).toHaveBeenCalledTimes(2);
    expect(mocks.appendAudit).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: hrPayrollCpmAuditActions.recommendation.approve,
      }),
    );
    expect(mocks.appendAudit).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: hrPayrollCpmAuditActions.payroll.integrate,
        summary: expect.stringContaining("Payroll Processing"),
        metadata: expect.objectContaining({
          payrollRefId: "hr_cpm_pay_mock_id",
          salaryChangeId: "hr_cpm_sal_mock_id",
        }),
      }),
    );
  });

  it("returns existing artifacts without re-inserting (idempotent finalize)", async () => {
    const { db, inserts } = buildMockTx({
      recommendation: {
        ...recommendation,
        recommendationStatus: "approved",
        lockedAt: new Date(),
      },
      existingSalaryChange: {
        id: "hr_cpm_sal_existing",
        employeeHistoryEventId: "hr_cpm_hist_existing",
      },
      existingPayrollRef: { id: "hr_cpm_pay_existing" },
    });

    const result = await finalizeHrCompensationApprovalInTx(db, {
      organizationId: "org-1",
      actorUserId: "user-1",
      recommendationId: recommendation.id,
      effectiveDate: new Date("2026-07-01T00:00:00.000Z"),
    });

    expect(result).toEqual({
      salaryChangeId: "hr_cpm_sal_existing",
      payrollRefId: "hr_cpm_pay_existing",
      historyEventId: "hr_cpm_hist_existing",
    });
    expect(inserts).toHaveLength(0);
    expect(mocks.insertHistory).not.toHaveBeenCalled();
    expect(mocks.appendAudit).not.toHaveBeenCalled();
  });
});

describe("payroll-compensation-changes bridge (CPM-027)", () => {
  beforeEach(() => {
    mocks.listPayrollRefs.mockReset();
    mocks.markPayrollSynced.mockReset();
  });

  it("delegates list to db payroll ref query", async () => {
    const periodStart = new Date("2026-07-01T00:00:00.000Z");
    const periodEnd = new Date("2026-07-31T23:59:59.999Z");
    mocks.listPayrollRefs.mockResolvedValue([
      {
        id: "hr_cpm_pay_1",
        employeeId: "hr_emp_1",
        payrollReferenceCode: "CPM-abcdef01",
        effectiveDate: periodStart,
        amountDelta: 1000,
        syncStatus: "pending",
      },
    ]);

    const rows = await listApprovedCompensationPayrollRefs({
      organizationId: "org-1",
      periodStart,
      periodEnd,
    });

    expect(mocks.listPayrollRefs).toHaveBeenCalledWith({
      organizationId: "org-1",
      periodStart,
      periodEnd,
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.syncStatus).toBe("pending");
  });

  it("delegates acknowledge sync inside organization context", async () => {
    mocks.markPayrollSynced.mockResolvedValue({ syncedCount: 2 });

    const result = await acknowledgeCompensationPayrollSync({
      organizationId: "org-1",
      payrollReferenceIds: ["hr_cpm_pay_1", "hr_cpm_pay_2"],
      actorUserId: "user-payroll",
    });

    expect(result.syncedCount).toBe(2);
    expect(mocks.markPayrollSynced).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        organizationId: "org-1",
        payrollReferenceIds: ["hr_cpm_pay_1", "hr_cpm_pay_2"],
        actorUserId: "user-payroll",
      }),
    );
  });
});
