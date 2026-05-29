import { describe, expect, it } from "vitest";

import { buildExceptionTrailingActions } from "../../src/employee-management/compliance-regulatory-tracking/components/hr.workforce.compliance-list-trailing.config.shared";
import { hrComplianceUiCopy } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-ui.copy.shared";

describe("compliance exception trailing config (Pattern C)", () => {
  it("prefills assign due date from correctiveActionDueDateInput cell", () => {
    const actions = buildExceptionTrailingActions(hrComplianceUiCopy.exceptions);
    const assign = actions[0];

    expect(assign?.submitLabel).toBe(
      hrComplianceUiCopy.exceptions.trailingAssignLabel,
    );
    expect(
      assign?.fields.find((field) => field.name === "correctiveActionDueDate"),
    ).toMatchObject({
      kind: "datetime-local",
      defaultFromCell: "correctiveActionDueDateInput",
    });
  });
});
