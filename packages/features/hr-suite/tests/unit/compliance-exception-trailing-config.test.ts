import { describe, expect, it } from "vitest";

import { buildExceptionTrailingActions } from "../../src/employee-management/compliance-regulatory-tracking/components/hr.workforce.compliance-list-trailing.config.shared";
import { hrComplianceUiCopy } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-ui.copy.shared";

describe("compliance exception trailing config (Pattern C)", () => {
  const employeeOptions = [{ value: "emp_owner", label: "Alex Operator (E-100)" }];

  it("serializes assign action with actionKey and description prefill cell", () => {
    const actions = buildExceptionTrailingActions(
      hrComplianceUiCopy.exceptions,
      employeeOptions,
    );
    const assign = actions.find((action) => action.actionKey === "assign");

    expect(assign?.submitLabel).toBe(
      hrComplianceUiCopy.exceptions.trailingAssignLabel,
    );
    expect(
      assign?.fields.find((field) => field.name === "correctiveActionDueDate"),
    ).toMatchObject({
      kind: "datetime-local",
      defaultFromCell: "correctiveActionDueDateInput",
    });
    expect(
      assign?.fields.find(
        (field) => field.name === "correctiveActionOwnerEmployeeId",
      ),
    ).toMatchObject({
      kind: "labeled-select",
      defaultFromCell: "correctiveActionOwnerEmployeeIdValue",
      options: employeeOptions,
    });
    expect(
      assign?.fields.find(
        (field) => field.name === "correctiveActionDescription",
      ),
    ).toMatchObject({
      kind: "text",
      label: hrComplianceUiCopy.exceptions.trailingCorrectiveDescriptionLabel,
      defaultFromCell: "correctiveActionDescriptionValue",
    });
  });

  it("gates progress updates to in_progress rows only", () => {
    const actions = buildExceptionTrailingActions(
      hrComplianceUiCopy.exceptions,
      employeeOptions,
    );
    const progress = actions.find((action) => action.actionKey === "progress");

    expect(progress?.showWhen?.("in_progress")).toBe(true);
    expect(progress?.showWhen?.("open")).toBe(false);
    expect(progress?.showWhen?.("resolved")).toBe(false);
    expect(
      progress?.fields.find((field) => field.name === "progressNote"),
    ).toMatchObject({
      kind: "text",
      label: hrComplianceUiCopy.exceptions.trailingProgressNoteLabel,
    });
  });
});
