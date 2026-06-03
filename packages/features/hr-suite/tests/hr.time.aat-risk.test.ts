import { describe, expect, it, vi } from "vitest";

vi.mock("@afenda/kernel/execution", () => ({
  requireExecutionContext: vi.fn(),
  requireExecutionPermission: vi.fn(),
  hasExecutionPermission: vi.fn(),
}));

vi.mock("@afenda/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...actual,
    getUserProfile: vi.fn().mockResolvedValue({ email: "actor@acme.test" }),
    resolveHrEmployeeIdsForAuthUser: vi.fn().mockResolvedValue(["emp_actor"]),
    resolveEmployeeIdsVisibleToActor: vi
      .fn()
      .mockResolvedValue(["emp_team_1"]),
  };
});

import {
  hasExecutionPermission,
  requireExecutionContext,
} from "@afenda/kernel/execution";

import {
  classifyHrAatAbsenceRisk,
  parseHrAatAbsenceRiskThresholds,
} from "../policies/hr.time.aat-risk-threshold.policy.server";
import {
  requireHrAatPayrollRefRead,
  requireHrAatRiskRead,
  requireHrAatRiskThresholdWrite,
} from "../policies/hr.time.aat-access.policy.server";
import {
  DEFAULT_HR_AAT_ABSENCE_RISK_THRESHOLDS,
  HR_AAT_RISK_LEVEL_BADGE_TONE,
  hrAatAbsenceRiskThresholdsSchema,
} from "../schemas/hr.time.aat-risk.schema";

describe("HRM-AAT-018 configurable absence risk thresholds", () => {
  it("accepts monotonic default thresholds", () => {
    const parsed = hrAatAbsenceRiskThresholdsSchema.safeParse(
      DEFAULT_HR_AAT_ABSENCE_RISK_THRESHOLDS,
    );
    expect(parsed.success).toBe(true);
  });

  it("rejects non-monotonic rate bands", () => {
    const parsed = hrAatAbsenceRiskThresholdsSchema.safeParse({
      ...DEFAULT_HR_AAT_ABSENCE_RISK_THRESHOLDS,
      watchAbsenceRatePercent: 20,
      atRiskAbsenceRatePercent: 10,
    });
    expect(parsed.success).toBe(false);
  });

  it("parses thresholds via policy helper", () => {
    const thresholds = parseHrAatAbsenceRiskThresholds({
      watchAbsenceRatePercent: 4,
      atRiskAbsenceRatePercent: 8,
      highRiskAbsenceRatePercent: 12,
      criticalAbsenceRatePercent: 20,
      watchAbsenceFrequency: 2,
      atRiskAbsenceFrequency: 4,
      highRiskAbsenceFrequency: 6,
      criticalAbsenceFrequency: 9,
    });
    expect(thresholds.criticalAbsenceRatePercent).toBe(20);
  });
});

describe("HRM-AAT-019 absence risk classification", () => {
  it("classifies normal when below watch bands", () => {
    const result = classifyHrAatAbsenceRisk({
      absenceRatePercent: 2,
      absenceFrequency: 1,
    });
    expect(result.riskLevel).toBe("normal");
    expect(result.breachedSignals).toHaveLength(0);
  });

  it("classifies critical when rate exceeds critical threshold", () => {
    const result = classifyHrAatAbsenceRisk({
      absenceRatePercent: 30,
      absenceFrequency: 1,
    });
    expect(result.riskLevel).toBe("critical");
    expect(result.breachedSignals).toContain("absence_rate");
  });

  it("uses the higher tier when frequency exceeds rate tier", () => {
    const result = classifyHrAatAbsenceRisk({
      absenceRatePercent: 3,
      absenceFrequency: 12,
    });
    expect(result.riskLevel).toBe("critical");
    expect(result.breachedSignals).toContain("absence_frequency");
  });

  it("maps risk levels to governed badge tones", () => {
    expect(HR_AAT_RISK_LEVEL_BADGE_TONE.normal).toBe("default");
    expect(HR_AAT_RISK_LEVEL_BADGE_TONE.watch).toBe("attention");
    expect(HR_AAT_RISK_LEVEL_BADGE_TONE.high_risk).toBe("critical");
    expect(HR_AAT_RISK_LEVEL_BADGE_TONE.critical).toBe("critical");
  });
});

describe("HRM-AAT-020 risk indicator access", () => {
  it("denies self-scope employees without manager/HR role", async () => {
    const context = {
      userId: "user-1",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "member" as const,
      capabilities: ["hr.view" as const, "hr.attendance.read" as const],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(hasExecutionPermission).mockImplementation((_ctx, capability) => {
      return capability === "hr.view" || capability === "hr.attendance.read";
    });

    await expect(requireHrAatRiskRead()).rejects.toThrow(/hr_aat_risk_read_denied/);
  });

  it("allows managers with team scope", async () => {
    const context = {
      userId: "mgr-1",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "member" as const,
      capabilities: ["hr.view" as const, "hr.leave.read" as const],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(hasExecutionPermission).mockImplementation((_ctx, capability) => {
      return capability === "hr.view" || capability === "hr.leave.read";
    });

    const guard = await requireHrAatRiskRead();
    expect(guard.accessRole).toBe("manager");
    expect(guard.canViewRiskIndicators).toBe(true);
  });
});

describe("HRM-AAT-018 threshold write access", () => {
  it("requires HR attendance write for threshold configuration", async () => {
    const context = {
      userId: "hr-1",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "admin" as const,
      capabilities: [
        "hr.view" as const,
        "hr.leave.read" as const,
        "hr.leave.write" as const,
        "hr.attendance.read" as const,
        "hr.attendance.write" as const,
      ],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(hasExecutionPermission).mockImplementation((_ctx, capability) =>
      (context.capabilities as readonly string[]).includes(capability),
    );

    const guard = await requireHrAatRiskThresholdWrite();
    expect(guard.canConfigureRiskThresholds).toBe(true);
  });
});

describe("HRM-AAT-022 payroll ref access via LAM boundary", () => {
  it("requires leave and attendance read", async () => {
    const context = {
      userId: "pay-1",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "member" as const,
      capabilities: ["hr.view" as const, "hr.leave.read" as const],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(hasExecutionPermission).mockImplementation((_ctx, capability) => {
      return capability === "hr.view" || capability === "hr.leave.read";
    });

    await expect(requireHrAatPayrollRefRead()).rejects.toThrow(
      /hr_aat_payroll_ref_read_denied/,
    );
  });
});
