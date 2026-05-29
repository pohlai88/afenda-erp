import { describe, expect, it } from "vitest";

import {
  formatComplianceEnumLabel,
  hrComplianceFormDateTimeInput,
  readOptionalComplianceFormField,
} from "../../src/employee-management/compliance-regulatory-tracking/schemas/hr.workforce.compliance-form.shared";

describe("hrComplianceFormDateTimeInput", () => {
  it("accepts ISO datetime strings", () => {
    const result = hrComplianceFormDateTimeInput.safeParse(
      "2026-05-29T14:30:00.000Z",
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(new Date("2026-05-29T14:30:00.000Z"));
    }
  });

  it("accepts datetime-local form values", () => {
    const result = hrComplianceFormDateTimeInput.safeParse("2026-05-29T14:30");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.getTime()).not.toBeNaN();
    }
  });

  it("rejects invalid datetime input", () => {
    const result = hrComplianceFormDateTimeInput.safeParse("not-a-date");
    expect(result.success).toBe(false);
  });
});

describe("readOptionalComplianceFormField", () => {
  it("returns trimmed string values and ignores empty entries", () => {
    const formData = new FormData();
    formData.set("title", "Policy acknowledgement");
    formData.set("description", "");

    expect(readOptionalComplianceFormField(formData, "title")).toBe(
      "Policy acknowledgement",
    );
    expect(readOptionalComplianceFormField(formData, "description")).toBeUndefined();
    expect(readOptionalComplianceFormField(formData, "missing")).toBeUndefined();
  });
});

describe("formatComplianceEnumLabel", () => {
  it("formats snake_case enum values for display", () => {
    expect(formatComplianceEnumLabel("policy_acknowledgement")).toBe(
      "Policy Acknowledgement",
    );
  });
});
