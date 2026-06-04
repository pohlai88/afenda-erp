import { describe, expect, it } from "vitest";

import {
  resolveSystemAdminApprovalRowTrailingAction,
  SYSTEM_ADMIN_APPROVAL_ROW_TRAILING_ACTION_IDS,
  SYSTEM_ADMIN_APPROVALS_MANAGE_CAPABILITY,
  SYSTEM_ADMIN_APPROVALS_MANAGE_DENIED,
} from "../../src/features/approvals/sys-approvals-list-trailing.shared";
import { systemAdminApprovalsUiCopy } from "../../src/features/approvals/sys-approvals-ui.copy.shared";

describe("resolveSystemAdminApprovalRowTrailingAction", () => {
  it("returns ready disable metadata with confirm for active enabled rules", () => {
    const action = resolveSystemAdminApprovalRowTrailingAction({
      status: "active",
      enabled: true,
      canMutate: true,
    });

    expect(action?.state).toBe("ready");
    expect(action?.descriptor?.id).toBe(
      SYSTEM_ADMIN_APPROVAL_ROW_TRAILING_ACTION_IDS.disable,
    );
    expect(action?.descriptor?.intent).toBe("destructive");
    expect(action?.descriptor?.label).toBe(
      systemAdminApprovalsUiCopy.list.disableActionLabel,
    );
    expect(action?.descriptor?.confirm).toEqual(
      systemAdminApprovalsUiCopy.list.trailingConfirms.disable,
    );
  });

  it("returns ready enable metadata for active disabled rules", () => {
    const action = resolveSystemAdminApprovalRowTrailingAction({
      status: "disabled",
      enabled: false,
      canMutate: true,
    });

    expect(action?.state).toBe("ready");
    expect(action?.descriptor?.id).toBe(
      SYSTEM_ADMIN_APPROVAL_ROW_TRAILING_ACTION_IDS.enable,
    );
    expect(action?.descriptor?.intent).toBe("default");
    expect(action?.descriptor?.confirm).toBeUndefined();
  });

  it("hides list enable toggle for deprecated rules awaiting review reactivation", () => {
    const action = resolveSystemAdminApprovalRowTrailingAction({
      status: "deprecated",
      enabled: false,
      canMutate: true,
    });

    expect(action?.state).toBe("hidden");
  });

  it("allows disable-only trailing metadata for deprecated enabled rules", () => {
    const action = resolveSystemAdminApprovalRowTrailingAction({
      status: "deprecated",
      enabled: true,
      canMutate: true,
    });

    expect(action?.state).toBe("ready");
    expect(action?.descriptor?.id).toBe(
      SYSTEM_ADMIN_APPROVAL_ROW_TRAILING_ACTION_IDS.disable,
    );
  });

  it("blocks mutation without system-admin.approvals.manage", () => {
    const action = resolveSystemAdminApprovalRowTrailingAction({
      status: "active",
      enabled: true,
      canMutate: false,
    });

    expect(action?.state).toBe("disabled");
    expect(action?.disabledReason).toBe(SYSTEM_ADMIN_APPROVALS_MANAGE_DENIED);
  });

  it("surfaces manage capability denial copy constants", () => {
    expect(SYSTEM_ADMIN_APPROVALS_MANAGE_CAPABILITY).toBe(
      "system-admin.approvals.manage",
    );
    expect(SYSTEM_ADMIN_APPROVALS_MANAGE_DENIED).toContain(
      SYSTEM_ADMIN_APPROVALS_MANAGE_CAPABILITY,
    );
  });
});
