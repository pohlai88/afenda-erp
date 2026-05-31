import { describe, expect, it } from "vitest";

import { hrPayrollSbsAuditActions } from "../events/hr.payroll.sbs-audit.event";
import { hrPayrollSbsMappingEvents } from "../events/hr.payroll.sbs-mapping.event";
import {
  HR_SBS_APPROVE_CAPABILITY,
  HR_SBS_READ_CAPABILITY,
  HR_SBS_WRITE_CAPABILITY,
} from "../schemas/hr.payroll.sbs-constants.shared";
import {
  hrSbsCreateMappingSchema,
  hrSbsReviewMappingSchema,
} from "../schemas/hr.payroll.sbs-mapping.schema";

describe("hr.payroll.sbs mapping schemas", () => {
  it("validates mapping create payload", () => {
    const parsed = hrSbsCreateMappingSchema.parse({
      benchmarkVersionId: "ver_1",
      benchmarkEntryId: "ent_1",
      grade: "G5",
      submitForApproval: true,
    });
    expect(parsed.submitForApproval).toBe(true);
  });

  it("validates mapping review payload", () => {
    const parsed = hrSbsReviewMappingSchema.parse({
      mappingId: "map_1",
      decision: "approved",
    });
    expect(parsed.decision).toBe("approved");
  });
});

describe("hr.payroll.sbs access capabilities", () => {
  it("exports read/write/approve capabilities", () => {
    expect(HR_SBS_READ_CAPABILITY).toBe("hr.sbs.read");
    expect(HR_SBS_WRITE_CAPABILITY).toBe("hr.sbs.write");
    expect(HR_SBS_APPROVE_CAPABILITY).toBe("hr.sbs.approve");
  });
});

describe("hr.payroll.sbs audit events", () => {
  it("defines survey, mapping, analysis, and report audit actions", () => {
    expect(hrPayrollSbsAuditActions.survey.upload).toBe("hr.sbs.survey.upload");
    expect(hrPayrollSbsAuditActions.mapping.create).toBe("hr.sbs.mapping.create");
    expect(hrPayrollSbsAuditActions.analysis.run).toBe("hr.sbs.analysis.run");
    expect(hrPayrollSbsAuditActions.report.export).toBe("hr.sbs.report.export");
    expect(hrPayrollSbsMappingEvents.approved).toBe("hr.sbs.mapping.approved");
  });
});
