import { describe, expect, it } from "vitest";

import {
  resolveSystemAdminApprovalQueueRowTrailingAction,
  SYSTEM_ADMIN_APPROVAL_QUEUE_ROW_TRAILING_ACTION_IDS,
  SYSTEM_ADMIN_APPROVALS_DECIDE_CAPABILITY,
  SYSTEM_ADMIN_APPROVALS_DECIDE_DENIED,
} from "../../src/features/approvals/sys-approvals-queue-list-trailing.shared";
import { systemAdminApprovalsUiCopy } from "../../src/features/approvals/sys-approvals-ui.copy.shared";

describe("resolveSystemAdminApprovalQueueRowTrailingAction", () => {
  it("returns ready approve metadata when the operator can decide", () => {
    const action = resolveSystemAdminApprovalQueueRowTrailingAction({
      decisionComplete: false,
      canDecide: true,
    });

    expect(action?.state).toBe("ready");
    expect(action?.descriptor?.id).toBe(
      SYSTEM_ADMIN_APPROVAL_QUEUE_ROW_TRAILING_ACTION_IDS.approve,
    );
    expect(action?.descriptor?.label).toBe(
      systemAdminApprovalsUiCopy.queue.approveActionLabel,
    );
    expect(action?.descriptor?.intent).toBe("approval");
  });

  it("hides trailing actions for completed decisions", () => {
    const action = resolveSystemAdminApprovalQueueRowTrailingAction({
      decisionComplete: true,
      canDecide: true,
    });

    expect(action?.state).toBe("hidden");
  });

  it("blocks mutation without approvals.decide", () => {
    const action = resolveSystemAdminApprovalQueueRowTrailingAction({
      decisionComplete: false,
      canDecide: false,
    });

    expect(action?.state).toBe("disabled");
    expect(action?.disabledReason).toBe(SYSTEM_ADMIN_APPROVALS_DECIDE_DENIED);
    expect(action?.descriptor?.label).toBe(
      systemAdminApprovalsUiCopy.queue.approveActionLabel,
    );
  });

  it("surfaces decide capability denial copy constants", () => {
    expect(SYSTEM_ADMIN_APPROVALS_DECIDE_CAPABILITY).toBe("approvals.decide");
    expect(SYSTEM_ADMIN_APPROVALS_DECIDE_DENIED).toContain(
      SYSTEM_ADMIN_APPROVALS_DECIDE_CAPABILITY,
    );
  });
});
