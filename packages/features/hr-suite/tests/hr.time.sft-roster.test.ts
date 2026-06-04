import { describe, expect, it, vi } from "vitest";

import { listHrTimeSftShiftRoster } from "./hr.time.sft-roster.server";
import { hrSftRosterQuerySchema } from "../schemas/hr.time.sft-roster.schema";

vi.mock("@afenda/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...actual,
    listHrShiftRosterWindow: vi.fn(),
  };
});

import { listHrShiftRosterWindow } from "@afenda/db";

describe("HRM-SFT-004 roster query schema", () => {
  it("accepts department, team, location, role, and legal entity filters", () => {
    const parsed = hrSftRosterQuerySchema.safeParse({
      periodStart: "2026-06-01",
      periodEnd: "2026-06-30",
      departmentId: "dept_1",
      teamId: "team_1",
      locationCode: "KL-HQ",
      positionId: "pos_1",
      legalEntityCode: "MY-01",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects inverted periods", () => {
    const parsed = hrSftRosterQuerySchema.safeParse({
      periodStart: "2026-06-30",
      periodEnd: "2026-06-01",
    });

    expect(parsed.success).toBe(false);
  });
});

describe("HRM-SFT-004 roster data layer", () => {
  it("forwards filters to db roster window", async () => {
    vi.mocked(listHrShiftRosterWindow).mockResolvedValue({
      rows: [
        {
          id: "asg_1",
          employeeId: "emp_1",
          employeeNumber: "E001",
          employeeDisplayName: "Alex",
          departmentId: "dept_1",
          departmentName: "Ops",
          positionId: null,
          positionTitle: null,
          locationCode: "KL-HQ",
          templateId: "tpl_1",
          templateCode: "DAY",
          templateName: "Day shift",
          assignmentKind: "shift",
          status: "scheduled",
          shiftDate: new Date("2026-06-10T00:00:00.000Z"),
          shiftStart: new Date("2026-06-10T08:00:00.000Z"),
          shiftEnd: new Date("2026-06-10T16:00:00.000Z"),
          notes: null,
          publishedAt: null,
        },
      ],
      pageSize: 25,
      totalCount: 1,
      hasNextPage: false,
    });

    const query = hrSftRosterQuerySchema.parse({
      periodStart: "2026-06-01",
      periodEnd: "2026-06-30",
      departmentId: "dept_1",
      legalEntityCode: "MY-01",
    });

    const window = await listHrTimeSftShiftRoster({
      organizationId: "org_1",
      query,
    });

    expect(window.rows).toHaveLength(1);
    expect(listHrShiftRosterWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org_1",
        departmentId: "dept_1",
        legalEntityCode: "MY-01",
      }),
    );
  });
});
