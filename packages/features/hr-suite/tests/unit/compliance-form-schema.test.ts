import { describe, expect, it } from "vitest";

import {
  formatComplianceEnumLabel,
  hrComplianceFormDateTimeInput,
  readComplianceFormTextField,
  readOptionalComplianceFormField,
} from "../../src/employee-management/compliance-regulatory-tracking/schemas/hr.workforce.compliance-form.shared";
import { parseUpdateHrWorkAuthorizationDocumentForm } from "../../src/employee-management/compliance-regulatory-tracking/schemas/hr.workforce.compliance-work-auth-documents.schema";
import { parseUpdateHrWorkEligibilityForm } from "../../src/employee-management/compliance-regulatory-tracking/schemas/hr.workforce.compliance-work-eligibility.schema";
import {
  parseUpdateHrEmployeeWorkplaceSafetyRequirementForm,
  updateHrEmployeeWorkplaceSafetyRequirementFormSchema,
} from "../../src/employee-management/compliance-regulatory-tracking/schemas/hr.workforce.compliance-workplace-safety.schema";
import {
  parseUpdateHrEmployeeSafetyTrainingRequirementForm,
  updateHrEmployeeSafetyTrainingRequirementFormSchema,
} from "../../src/employee-management/compliance-regulatory-tracking/schemas/hr.workforce.compliance-safety-training.schema";
import { parseUpdateHrEmployeePolicyAcknowledgementForm } from "../../src/employee-management/compliance-regulatory-tracking/schemas/hr.workforce.compliance-policy-acknowledgement.schema";

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

describe("readComplianceFormTextField", () => {
  it("preserves empty strings for nullable trailing fields", () => {
    const formData = new FormData();
    formData.set("documentNumber", "");

    expect(readComplianceFormTextField(formData, "documentNumber")).toBe("");
    expect(readComplianceFormTextField(formData, "missing")).toBeUndefined();
  });
});

describe("formatComplianceEnumLabel", () => {
  it("formats snake_case enum values for display", () => {
    expect(formatComplianceEnumLabel("policy_acknowledgement")).toBe(
      "Policy Acknowledgement",
    );
  });
});

describe("updateHrEmployeeWorkplaceSafetyRequirementFormSchema", () => {
  it("accepts certification expiry alongside status updates", () => {
    const parsed = updateHrEmployeeWorkplaceSafetyRequirementFormSchema.safeParse({
      requirementId: "00000000-0000-4000-8000-000000000001",
      status: "compliant",
      certificationExpiresAt: "2027-06-01T00:00",
      reviewNotes: "Renewed certification",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toBe("compliant");
      expect(parsed.data.certificationExpiresAt).toBeInstanceOf(Date);
      expect(parsed.data.reviewNotes).toBe("Renewed certification");
    }
  });

  it("maps cleared certification expiry to null", () => {
    const formData = new FormData();
    formData.set("requirementId", "00000000-0000-4000-8000-000000000001");
    formData.set("status", "compliant");
    formData.set("certificationExpiresAt", "");
    formData.set("reviewNotes", "");

    const parsed = parseUpdateHrEmployeeWorkplaceSafetyRequirementForm(formData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.certificationExpiresAt).toBeNull();
      expect(parsed.data.reviewNotes).toBeNull();
    }
  });
});

describe("updateHrEmployeeSafetyTrainingRequirementFormSchema", () => {
  it("accepts certification expiry alongside status updates", () => {
    const parsed = updateHrEmployeeSafetyTrainingRequirementFormSchema.safeParse({
      requirementId: "00000000-0000-4000-8000-000000000001",
      status: "compliant",
      certificationExpiresAt: "2027-06-01T00:00",
      reviewNotes: "Renewed certification",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.certificationExpiresAt).toBeInstanceOf(Date);
    }
  });

  it("maps cleared certification expiry to null from trailing forms", () => {
    const formData = new FormData();
    formData.set("requirementId", "00000000-0000-4000-8000-000000000001");
    formData.set("status", "compliant");
    formData.set("certificationExpiresAt", "");
    formData.set("reviewNotes", "");

    const parsed = parseUpdateHrEmployeeSafetyTrainingRequirementForm(formData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.certificationExpiresAt).toBeNull();
      expect(parsed.data.reviewNotes).toBeNull();
    }
  });
});

describe("parseUpdateHrWorkAuthorizationDocumentForm", () => {
  it("maps empty trailing fields to null without dropping them", () => {
    const formData = new FormData();
    formData.set(
      "workAuthDocumentId",
      "00000000-0000-4000-8000-000000000001",
    );
    formData.set("status", "verified");
    formData.set("documentNumber", "WP-100");
    formData.set("issuedAt", "");
    formData.set("expiresAt", "2027-06-01T00:00");
    formData.set("reviewNotes", "");

    const parsed = parseUpdateHrWorkAuthorizationDocumentForm(formData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.documentNumber).toBe("WP-100");
      expect(parsed.data.issuedAt).toBeNull();
      expect(parsed.data.expiresAt).toBeInstanceOf(Date);
      expect(parsed.data.reviewNotes).toBeNull();
    }
  });
});

describe("parseUpdateHrWorkEligibilityForm", () => {
  it("preserves explicit empty expiry and review notes as null", () => {
    const formData = new FormData();
    formData.set(
      "workEligibilityId",
      "00000000-0000-4000-8000-000000000002",
    );
    formData.set("status", "eligible");
    formData.set("expiresAt", "");
    formData.set("reviewNotes", "");

    const parsed = parseUpdateHrWorkEligibilityForm(formData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.expiresAt).toBeNull();
      expect(parsed.data.reviewNotes).toBeNull();
    }
  });
});

describe("parseUpdateHrEmployeePolicyAcknowledgementForm", () => {
  it("maps trailing acknowledgment updates from serialized row fields", () => {
    const formData = new FormData();
    formData.set("requirementId", "00000000-0000-4000-8000-000000000003");
    formData.set("status", "compliant");
    formData.set("reviewNotes", "Acknowledged in person");

    const parsed = parseUpdateHrEmployeePolicyAcknowledgementForm(formData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toBe("compliant");
      expect(parsed.data.reviewNotes).toBe("Acknowledged in person");
    }
  });

  it("maps cleared review notes to null", () => {
    const formData = new FormData();
    formData.set("requirementId", "00000000-0000-4000-8000-000000000003");
    formData.set("status", "compliant");
    formData.set("reviewNotes", "");

    const parsed = parseUpdateHrEmployeePolicyAcknowledgementForm(formData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.reviewNotes).toBeNull();
    }
  });
});
