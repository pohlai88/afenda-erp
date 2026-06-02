import { afterEach, describe, expect, it, vi } from "vitest";

import {
  GOVERNED_ACTION_ID_FIELD,
  GOVERNED_CONFIRM_FIELD,
  GOVERNED_FORM_ID_FIELD,
  GOVERNED_SELECTED_ROW_ID_FIELD,
  GOVERNED_STEP_UP_TOKEN_FIELD,
  actionFailure,
  actionSuccess,
  clearGovernedServerActionRegistryForTest,
  registerGovernedBulkServerAction,
  registerGovernedGuardedServerAction,
  registerGovernedPolicyBulkServerAction,
  registerGovernedPolicyServerAction,
  registerGovernedServerAction,
  resolveGovernedServerAction,
  resolveGovernedBulkServerAction,
  setGovernedServerActionAuditSinkForTest,
  validateGovernedServerActionPolicySubmission,
  validateGovernedServerActionSubmission,
  withGovernedServerActionPolicyGuard,
  withGovernedServerActionSubmissionGuard,
} from "../../src/schemas";

describe("governed server action submission guard", () => {
  afterEach(() => {
    clearGovernedServerActionRegistryForTest();
  });

  it("accepts matching governed action and form ids", () => {
    const formData = new FormData();
    formData.set(GOVERNED_ACTION_ID_FIELD, "submit-score");
    formData.set(GOVERNED_FORM_ID_FIELD, "supplier-scorecard");

    expect(
      validateGovernedServerActionSubmission(formData, {
        actionId: "submit-score",
        formId: "supplier-scorecard",
      }),
    ).toEqual({ ok: true });
  });

  it("rejects tampered governed action ids", () => {
    const formData = new FormData();
    formData.set(GOVERNED_ACTION_ID_FIELD, "delete-record");
    formData.set(GOVERNED_FORM_ID_FIELD, "supplier-scorecard");

    const result = validateGovernedServerActionSubmission(formData, {
      actionId: "submit-score",
      formId: "supplier-scorecard",
    });

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({
      code: "governed.action.mismatch",
    });
  });

  it("rejects tampered governed form ids before invoking the handler", async () => {
    const handler = vi.fn(async () => actionSuccess());
    const guarded = withGovernedServerActionSubmissionGuard(
      {
        actionId: "submit-score",
        formId: "supplier-scorecard",
      },
      handler,
    );
    const formData = new FormData();
    formData.set(GOVERNED_ACTION_ID_FIELD, "submit-score");
    formData.set(GOVERNED_FORM_ID_FIELD, "other-form");

    const result = await guarded(undefined, formData);

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({
      code: "governed.form.mismatch",
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("registers guarded server actions by metadata action id", async () => {
    const handler = vi.fn(async () => actionSuccess());
    registerGovernedGuardedServerAction(
      {
        actionId: "approve-request",
        formId: "approval-form",
      },
      handler,
    );

    const registered = resolveGovernedServerAction("approve-request");
    const validFormData = new FormData();
    validFormData.set(GOVERNED_ACTION_ID_FIELD, "approve-request");
    validFormData.set(GOVERNED_FORM_ID_FIELD, "approval-form");

    await expect(registered?.(undefined, validFormData)).resolves.toEqual({
      ok: true,
    });
    expect(handler).toHaveBeenCalledTimes(1);

    const tamperedFormData = new FormData();
    tamperedFormData.set(GOVERNED_ACTION_ID_FIELD, "approve-request");
    tamperedFormData.set(GOVERNED_FORM_ID_FIELD, "other-form");

    await expect(registered?.(undefined, tamperedFormData)).resolves.toMatchObject(
      {
        ok: false,
        code: "governed.form.mismatch",
      },
    );
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("only resolves bulk actions registered with selected row expectations", () => {
    registerGovernedServerAction("plain-bulk", async () => actionSuccess());
    registerGovernedGuardedServerAction(
      { actionId: "guarded-no-selection" },
      async () => actionSuccess(),
    );
    registerGovernedBulkServerAction(
      {
        actionId: "guarded-bulk",
        selectedRows: { min: 1 },
      },
      async () => actionSuccess(),
    );

    expect(resolveGovernedBulkServerAction("plain-bulk")).toBeUndefined();
    expect(
      resolveGovernedBulkServerAction("guarded-no-selection"),
    ).toBeUndefined();
    expect(resolveGovernedBulkServerAction("guarded-bulk")).toBeTypeOf(
      "function",
    );
  });

  it("validates governed selected row ids for bulk actions", () => {
    const formData = new FormData();
    formData.set(GOVERNED_ACTION_ID_FIELD, "bulk-close");
    formData.append(GOVERNED_SELECTED_ROW_ID_FIELD, "row-1");
    formData.append(GOVERNED_SELECTED_ROW_ID_FIELD, "row-2");

    expect(
      validateGovernedServerActionSubmission(formData, {
        actionId: "bulk-close",
        selectedRows: {
          min: 1,
          max: 2,
          allowedIds: ["row-1", "row-2", "row-3"],
        },
      }),
    ).toEqual({ ok: true });
  });

  it("rejects governed bulk actions with unauthorized selected row ids", () => {
    const formData = new FormData();
    formData.set(GOVERNED_ACTION_ID_FIELD, "bulk-close");
    formData.append(GOVERNED_SELECTED_ROW_ID_FIELD, "row-1");
    formData.append(GOVERNED_SELECTED_ROW_ID_FIELD, "row-99");

    const result = validateGovernedServerActionSubmission(formData, {
      actionId: "bulk-close",
      selectedRows: {
        min: 1,
        allowedIds: ["row-1", "row-2"],
      },
    });

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({
      code: "governed.selection.mismatch",
    });
  });

  it("rejects missing governed confirmation policy", async () => {
    const formData = new FormData();
    formData.set(GOVERNED_ACTION_ID_FIELD, "bulk-suspend");

    const result = await validateGovernedServerActionPolicySubmission(formData, {
      actionId: "bulk-suspend",
      confirmation: { required: true },
    });

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({
      code: "governed.confirmation.required",
    });
  });

  it("rejects invalid governed confirmation policy", async () => {
    const formData = new FormData();
    formData.set(GOVERNED_ACTION_ID_FIELD, "bulk-suspend");
    formData.set(GOVERNED_CONFIRM_FIELD, "wrong");

    const result = await validateGovernedServerActionPolicySubmission(formData, {
      actionId: "bulk-suspend",
      confirmation: { required: true },
    });

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({
      code: "governed.confirmation.mismatch",
    });
  });

  it("rejects missing governed step-up token policy", async () => {
    const formData = new FormData();
    formData.set(GOVERNED_ACTION_ID_FIELD, "approve-payment");

    const result = await validateGovernedServerActionPolicySubmission(formData, {
      actionId: "approve-payment",
      stepUp: {
        required: true,
        verify: async () => actionSuccess(),
      },
    });

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({
      code: "governed.step_up.required",
    });
  });

  it("returns failed step-up verifier ActionResult without invoking handler", async () => {
    const handler = vi.fn(async () => actionSuccess());
    const guarded = withGovernedServerActionPolicyGuard(
      {
        actionId: "approve-payment",
        stepUp: {
          required: true,
          verify: async () =>
            actionFailure(
              "Step-up token was rejected.",
              undefined,
              "step_up.invalid",
            ),
        },
      },
      handler,
    );
    const formData = new FormData();
    formData.set(GOVERNED_ACTION_ID_FIELD, "approve-payment");
    formData.set(GOVERNED_STEP_UP_TOKEN_FIELD, "bad-token");

    const result = await guarded(undefined, formData);

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ code: "step_up.invalid" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("only resolves policy bulk actions when selected row expectations exist", () => {
    registerGovernedPolicyServerAction(
      {
        actionId: "policy-no-selection",
        confirmation: { required: true },
      },
      async () => actionSuccess(),
    );
    registerGovernedPolicyBulkServerAction(
      {
        actionId: "policy-bulk",
        selectedRows: { min: 1 },
        confirmation: { required: true },
      },
      async () => actionSuccess(),
    );

    expect(resolveGovernedBulkServerAction("policy-no-selection")).toBeUndefined();
    expect(resolveGovernedBulkServerAction("policy-bulk")).toBeTypeOf(
      "function",
    );
  });

  it("emits audit events for rejected and successful policy paths", async () => {
    const events: Array<{ stage: string; code?: string }> = [];
    setGovernedServerActionAuditSinkForTest((event) => {
      events.push({ stage: event.stage, code: event.code });
    });

    const guarded = withGovernedServerActionPolicyGuard(
      {
        actionId: "bulk-close",
        selectedRows: { min: 1 },
        confirmation: { required: true },
      },
      async () => actionSuccess(),
    );

    const rejected = new FormData();
    rejected.set(GOVERNED_ACTION_ID_FIELD, "bulk-close");
    rejected.append(GOVERNED_SELECTED_ROW_ID_FIELD, "case-1");
    await guarded(undefined, rejected);

    const accepted = new FormData();
    accepted.set(GOVERNED_ACTION_ID_FIELD, "bulk-close");
    accepted.set(GOVERNED_CONFIRM_FIELD, "confirmed");
    accepted.append(GOVERNED_SELECTED_ROW_ID_FIELD, "case-1");
    await guarded(undefined, accepted);

    expect(events).toEqual([
      { stage: "submitted", code: undefined },
      {
        stage: "policy-rejected",
        code: "governed.confirmation.required",
      },
      { stage: "submitted", code: undefined },
      { stage: "succeeded", code: undefined },
    ]);
  });
});
