import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "./action-result.shared";

/**
 * Maps governed form `actionId` strings to their Server Action handlers.
 * Feature modules register actions at the app boundary; renderers resolve
 * by id only — they never hold a direct reference to the handler.
 *
 * The registry is a module-level singleton. In production, duplicate
 * registration is a programming error and throws. In development,
 * re-registration is allowed silently so hot-module reload does not
 * crash the dev server when a consuming module is re-evaluated.
 */
export type GovernedServerActionHandler<TInput = FormData, TData = void> = (
  prev: ActionResult<TData> | undefined,
  input: TInput,
) => Promise<ActionResult<TData>>;

export const GOVERNED_FORM_ID_FIELD = "__governedFormId";
export const GOVERNED_ACTION_ID_FIELD = "__governedActionId";
export const GOVERNED_SELECTED_ROW_ID_FIELD = "__governedSelectedRowId";
export const GOVERNED_CONFIRM_FIELD = "__governedConfirm";
export const GOVERNED_STEP_UP_TOKEN_FIELD = "__governedStepUpToken";

export type GovernedServerActionSubmissionExpectation = {
  actionId: string;
  formId?: string;
  selectedRows?: {
    min?: number;
    max?: number;
    allowedIds?: readonly string[];
  };
};

export type GovernedServerActionAuditMetadata = {
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
  targetType?: string;
};

export type GovernedServerActionStepUpVerifier = (input: {
  token: string;
  formData: FormData;
  expectation: GovernedServerActionPolicyExpectation;
}) => Promise<ActionResult<void>>;

export type GovernedServerActionPolicyExpectation =
  GovernedServerActionSubmissionExpectation & {
    confirmation?: {
      required?: boolean;
      expectedValue?: string;
    };
    stepUp?: {
      required?: boolean;
      verify: GovernedServerActionStepUpVerifier;
    };
    audit?: GovernedServerActionAuditMetadata;
  };

export type GovernedServerActionAuditStage =
  | "submitted"
  | "guard-rejected"
  | "policy-rejected"
  | "succeeded"
  | "failed";

export type GovernedServerActionAuditEvent = GovernedServerActionAuditMetadata & {
  actionId: string;
  stage: GovernedServerActionAuditStage;
  code?: string;
  selectedRowCount?: number;
};

export type GovernedServerActionAuditSink = (
  event: GovernedServerActionAuditEvent,
) => void | Promise<void>;

export type GovernedServerActionRegistry = ReadonlyMap<
  string,
  GovernedServerActionHandler
>;

export type GovernedServerActionRegistration = {
  handler: GovernedServerActionHandler;
  guarded: boolean;
  policy: boolean;
  expectation?:
    | GovernedServerActionSubmissionExpectation
    | GovernedServerActionPolicyExpectation;
};

const governedServerActionRegistry = new Map<
  string,
  GovernedServerActionHandler
>();
const governedServerActionRegistrations = new Map<
  string,
  GovernedServerActionRegistration
>();
let governedServerActionAuditSink: GovernedServerActionAuditSink | undefined;

function normalizeActionId(actionId: string): string {
  const normalized = actionId.trim();

  if (!normalized) {
    throw new Error("Governed server action id must not be empty.");
  }

  return normalized;
}

function normalizeOptionalFormId(formId: string | undefined): string | undefined {
  const normalized = formId?.trim();
  return normalized ? normalized : undefined;
}

function getRequiredFormDataString(
  formData: FormData,
  key: string,
): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

export function getGovernedSelectedRowIds(formData: FormData): string[] {
  return formData
    .getAll(GOVERNED_SELECTED_ROW_ID_FIELD)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function validateGovernedServerActionSubmission(
  formData: FormData,
  expectation: GovernedServerActionSubmissionExpectation,
): ActionResult<void> {
  const expectedActionId = normalizeActionId(expectation.actionId);
  const postedActionId = getRequiredFormDataString(
    formData,
    GOVERNED_ACTION_ID_FIELD,
  );

  if (postedActionId !== expectedActionId) {
    return actionFailure(
      "Governed action submission did not match the registered action.",
      undefined,
      "governed.action.mismatch",
    );
  }

  const expectedFormId = normalizeOptionalFormId(expectation.formId);

  if (expectedFormId) {
    const postedFormId = getRequiredFormDataString(
      formData,
      GOVERNED_FORM_ID_FIELD,
    );

    if (postedFormId !== expectedFormId) {
      return actionFailure(
        "Governed form submission did not match the registered form.",
        undefined,
        "governed.form.mismatch",
      );
    }
  }

  const selectedRowsExpectation = expectation.selectedRows;

  if (selectedRowsExpectation) {
    const selectedRowIds = getGovernedSelectedRowIds(formData);
    const min = selectedRowsExpectation.min ?? 0;
    const max = selectedRowsExpectation.max;

    if (selectedRowIds.length < min) {
      return actionFailure(
        "Governed bulk action submission did not include enough selected rows.",
        undefined,
        "governed.selection.too_few",
      );
    }

    if (max !== undefined && selectedRowIds.length > max) {
      return actionFailure(
        "Governed bulk action submission included too many selected rows.",
        undefined,
        "governed.selection.too_many",
      );
    }

    if (selectedRowsExpectation.allowedIds) {
      const allowedIds = new Set(selectedRowsExpectation.allowedIds);
      const unauthorized = selectedRowIds.some(
        (rowId) => !allowedIds.has(rowId),
      );

      if (unauthorized) {
        return actionFailure(
          "Governed bulk action submission included rows outside the allowed selection set.",
          undefined,
          "governed.selection.mismatch",
        );
      }
    }
  }

  return actionSuccess();
}

function isSubmissionGuardCode(code: string | undefined): boolean {
  return Boolean(
    code?.startsWith("governed.action.") ||
      code?.startsWith("governed.form.") ||
      code?.startsWith("governed.selection."),
  );
}

async function emitGovernedServerActionAudit(
  expectation:
    | GovernedServerActionSubmissionExpectation
    | GovernedServerActionPolicyExpectation,
  event: Omit<GovernedServerActionAuditEvent, "actionId">,
): Promise<void> {
  if (!governedServerActionAuditSink) {
    return;
  }

  const audit: GovernedServerActionAuditMetadata =
    "audit" in expectation && expectation.audit ? expectation.audit : {};
  await governedServerActionAuditSink({
    ...audit,
    actionId: expectation.actionId,
    ...event,
  });
}

export async function validateGovernedServerActionPolicySubmission(
  formData: FormData,
  expectation: GovernedServerActionPolicyExpectation,
): Promise<ActionResult<void>> {
  const submission = validateGovernedServerActionSubmission(
    formData,
    expectation,
  );

  if (!submission.ok) {
    return submission;
  }

  if (expectation.confirmation?.required) {
    const postedConfirmation = getRequiredFormDataString(
      formData,
      GOVERNED_CONFIRM_FIELD,
    );
    const expectedConfirmation =
      expectation.confirmation.expectedValue ?? "confirmed";

    if (!postedConfirmation) {
      return actionFailure(
        "Governed action confirmation is required.",
        undefined,
        "governed.confirmation.required",
      );
    }

    if (postedConfirmation !== expectedConfirmation) {
      return actionFailure(
        "Governed action confirmation did not match the expected value.",
        undefined,
        "governed.confirmation.mismatch",
      );
    }
  }

  if (expectation.stepUp?.required) {
    const token = getRequiredFormDataString(
      formData,
      GOVERNED_STEP_UP_TOKEN_FIELD,
    );

    if (!token) {
      return actionFailure(
        "Governed action step-up verification is required.",
        undefined,
        "governed.step_up.required",
      );
    }

    const verified = await expectation.stepUp.verify({
      token,
      formData,
      expectation,
    });

    if (!verified.ok) {
      return verified;
    }
  }

  return actionSuccess();
}

export function withGovernedServerActionSubmissionGuard<TData = void>(
  expectation: GovernedServerActionSubmissionExpectation,
  handler: GovernedServerActionHandler<FormData, TData>,
): GovernedServerActionHandler<FormData, TData> {
  return async (prev, input) => {
    const validation = validateGovernedServerActionSubmission(
      input,
      expectation,
    );

    if (!validation.ok) {
      return validation;
    }

    return handler(prev, input);
  };
}

export function withGovernedServerActionPolicyGuard<TData = void>(
  expectation: GovernedServerActionPolicyExpectation,
  handler: GovernedServerActionHandler<FormData, TData>,
): GovernedServerActionHandler<FormData, TData> {
  return async (prev, input) => {
    await emitGovernedServerActionAudit(expectation, {
      stage: "submitted",
      selectedRowCount: getGovernedSelectedRowIds(input).length,
    });

    const validation = await validateGovernedServerActionPolicySubmission(
      input,
      expectation,
    );

    if (!validation.ok) {
      await emitGovernedServerActionAudit(expectation, {
        stage: isSubmissionGuardCode(validation.code)
          ? "guard-rejected"
          : "policy-rejected",
        code: validation.code,
        selectedRowCount: getGovernedSelectedRowIds(input).length,
      });
      return validation;
    }

    const result = await handler(prev, input);

    await emitGovernedServerActionAudit(expectation, {
      stage: result.ok ? "succeeded" : "failed",
      code: result.ok ? undefined : result.code,
      selectedRowCount: getGovernedSelectedRowIds(input).length,
    });

    return result;
  };
}

export function registerGovernedGuardedServerAction<TData = void>(
  expectation: GovernedServerActionSubmissionExpectation,
  handler: GovernedServerActionHandler<FormData, TData>,
): void {
  registerGovernedServerActionInternal(
    expectation.actionId,
    withGovernedServerActionSubmissionGuard(expectation, handler),
    {
      guarded: true,
      policy: false,
      expectation,
    },
  );
}

export function registerGovernedPolicyServerAction<TData = void>(
  expectation: GovernedServerActionPolicyExpectation,
  handler: GovernedServerActionHandler<FormData, TData>,
): void {
  registerGovernedServerActionInternal(
    expectation.actionId,
    withGovernedServerActionPolicyGuard(expectation, handler),
    {
      guarded: true,
      policy: true,
      expectation,
    },
  );
}

export function registerGovernedBulkServerAction<TData = void>(
  expectation: GovernedServerActionSubmissionExpectation & {
    selectedRows: NonNullable<
      GovernedServerActionSubmissionExpectation["selectedRows"]
    >;
  },
  handler: GovernedServerActionHandler<FormData, TData>,
): void {
  registerGovernedGuardedServerAction(
    {
      ...expectation,
      selectedRows: expectation.selectedRows,
    },
    handler,
  );
}

export function registerGovernedPolicyBulkServerAction<TData = void>(
  expectation: GovernedServerActionPolicyExpectation & {
    selectedRows: NonNullable<
      GovernedServerActionSubmissionExpectation["selectedRows"]
    >;
  },
  handler: GovernedServerActionHandler<FormData, TData>,
): void {
  registerGovernedPolicyServerAction(
    {
      ...expectation,
      selectedRows: expectation.selectedRows,
    },
    handler,
  );
}

function registerGovernedServerActionInternal<TInput = FormData, TData = void>(
  actionId: string,
  handler: GovernedServerActionHandler<TInput, TData>,
  metadata: Pick<
    GovernedServerActionRegistration,
    "guarded" | "policy" | "expectation"
  >,
): void {
  const normalizedActionId = normalizeActionId(actionId);
  const registryHandler = handler as unknown as GovernedServerActionHandler;

  if (governedServerActionRegistry.has(normalizedActionId)) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Governed server action "${normalizedActionId}" is already registered.`,
      );
    }

    // Development: allow re-registration so hot-module reload does not
    // crash when a consuming module is re-evaluated without reloading
    // the registry module itself.
    governedServerActionRegistry.set(normalizedActionId, registryHandler);
    governedServerActionRegistrations.set(normalizedActionId, {
      handler: registryHandler,
      guarded: metadata.guarded,
      policy: metadata.policy,
      ...(metadata.expectation ? { expectation: metadata.expectation } : {}),
    });
    return;
  }

  governedServerActionRegistry.set(normalizedActionId, registryHandler);
  governedServerActionRegistrations.set(normalizedActionId, {
    handler: registryHandler,
    guarded: metadata.guarded,
    policy: metadata.policy,
    ...(metadata.expectation ? { expectation: metadata.expectation } : {}),
  });
}

export function registerGovernedServerAction<TInput = FormData, TData = void>(
  actionId: string,
  handler: GovernedServerActionHandler<TInput, TData>,
): void {
  registerGovernedServerActionInternal(actionId, handler, {
    guarded: false,
    policy: false,
  });
}

export function resolveGovernedServerAction(
  actionId: string,
): GovernedServerActionHandler | undefined {
  return governedServerActionRegistry.get(normalizeActionId(actionId));
}

export function resolveGovernedBulkServerAction(
  actionId: string,
): GovernedServerActionHandler | undefined {
  const registration = governedServerActionRegistrations.get(
    normalizeActionId(actionId),
  );

  if (!registration?.guarded || !registration.expectation?.selectedRows) {
    return undefined;
  }

  return registration.handler;
}

export function getGovernedServerActionRegistration(
  actionId: string,
): GovernedServerActionRegistration | undefined {
  return governedServerActionRegistrations.get(normalizeActionId(actionId));
}

export function getGovernedServerActionRegistry(): GovernedServerActionRegistry {
  return governedServerActionRegistry;
}

export function setGovernedServerActionAuditSinkForTest(
  sink: GovernedServerActionAuditSink | undefined,
): void {
  if (process.env.NODE_ENV !== "test") {
    throw new Error(
      "setGovernedServerActionAuditSinkForTest may only be used in tests.",
    );
  }

  governedServerActionAuditSink = sink;
}

export function clearGovernedServerActionRegistryForTest(): void {
  if (process.env.NODE_ENV !== "test") {
    throw new Error(
      "clearGovernedServerActionRegistryForTest may only be used in tests.",
    );
  }

  governedServerActionRegistry.clear();
  governedServerActionRegistrations.clear();
  governedServerActionAuditSink = undefined;
}
