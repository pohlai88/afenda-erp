import { computeHrShiftWorkingMinutes } from "@afenda/db";
import { describe, expect, it, vi } from "vitest";

import {
  createHrTimeSftShiftTemplate,
  listHrTimeSftShiftTemplates,
} from "./hr.time.sft-template.server";
import {
  hrSftCreateShiftTemplateSchema,
  hrSftUpdateShiftTemplateSchema,
} from "../schemas/hr.time.sft-template.schema";

vi.mock("@afenda/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...actual,
    createHrShiftTemplate: vi.fn(),
    listHrShiftTemplatesWindow: vi.fn(),
    updateHrShiftTemplate: vi.fn(),
    archiveHrShiftTemplate: vi.fn(),
    getHrShiftTemplate: vi.fn(),
  };
});

vi.mock("../data/hr.time.sft-audit.server", () => ({
  emitHrSftAuditEvent: vi.fn(),
}));

import {
  createHrShiftTemplate,
  listHrShiftTemplatesWindow,
} from "@afenda/db";

describe("HRM-SFT-002 working hours", () => {
  it("subtracts break window from gross shift duration", () => {
    expect(
      computeHrShiftWorkingMinutes({
        startTime: "09:00",
        endTime: "18:00",
        breakStartTime: "12:00",
        breakEndTime: "13:00",
      }),
    ).toBe(8 * 60);
  });
});

describe("HRM-SFT-001/003 shift template schemas", () => {
  it("accepts fixed and night pattern kinds", () => {
    const parsed = hrSftCreateShiftTemplateSchema.safeParse({
      code: "NIGHT-A",
      name: "Night A",
      startTime: "22:00",
      endTime: "06:00",
      shiftCategory: "night",
      patternKind: "night",
    });
    expect(parsed.success).toBe(true);
  });

  it("requires paired break times", () => {
    const parsed = hrSftCreateShiftTemplateSchema.safeParse({
      code: "DAY-A",
      name: "Day A",
      startTime: "08:00",
      endTime: "17:00",
      breakStartTime: "12:00",
    });
    expect(parsed.success).toBe(false);
  });

  it("allows partial template updates", () => {
    const parsed = hrSftUpdateShiftTemplateSchema.safeParse({
      templateId: "tpl_1",
      patternKind: "rotating",
    });
    expect(parsed.success).toBe(true);
  });
});

describe("HRM-SFT-001 template data layer", () => {
  it("lists templates via db window", async () => {
    vi.mocked(listHrShiftTemplatesWindow).mockResolvedValue({
      rows: [],
      pageSize: 25,
      totalCount: 0,
      hasNextPage: false,
    });

    const window = await listHrTimeSftShiftTemplates({
      organizationId: "org_1",
    });

    expect(window.totalCount).toBe(0);
    expect(listHrShiftTemplatesWindow).toHaveBeenCalledWith({
      organizationId: "org_1",
    });
  });

  it("creates template through db command", async () => {
    vi.mocked(createHrShiftTemplate).mockResolvedValue({ templateId: "tpl_1" });

    const result = await createHrTimeSftShiftTemplate({
      organizationId: "org_1",
      actorAuthUserId: "user_1",
      payload: {
        code: "EARLY",
        name: "Early shift",
        startTime: "06:00",
        endTime: "14:00",
        shiftCategory: "day",
        patternKind: "fixed",
      },
    });

    expect(result.templateId).toBe("tpl_1");
  });
});
