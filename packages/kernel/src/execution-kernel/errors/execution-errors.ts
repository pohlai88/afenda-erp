export class ExecutionContextRequiredError extends Error {
  readonly code = "EXECUTION_CONTEXT_REQUIRED";

  constructor(message = "Execution context is required.") {
    super(message);
    this.name = "ExecutionContextRequiredError";
  }
}

export class ExecutionAccessDeniedError extends Error {
  readonly code = "EXECUTION_ACCESS_DENIED";

  constructor(
    readonly permission: string,
    readonly reason = "The active actor is not allowed to perform this action.",
  ) {
    super(reason);
    this.name = "ExecutionAccessDeniedError";
  }
}

export class ExecutionPolicyDeniedError extends Error {
  readonly code = "EXECUTION_POLICY_DENIED";

  constructor(
    readonly action: string,
    readonly targetType: string,
    readonly targetId: string | undefined,
    readonly reason = "Execution policy denied this action.",
  ) {
    super(reason);
    this.name = "ExecutionPolicyDeniedError";
  }
}

export class ExecutionInvalidStateError extends Error {
  readonly code = "EXECUTION_INVALID_STATE";

  constructor(message: string) {
    super(message);
    this.name = "ExecutionInvalidStateError";
  }
}

export class ExecutionCapabilityNotFoundError extends Error {
  readonly code = "EXECUTION_CAPABILITY_NOT_FOUND";

  constructor(readonly capabilityKey: string) {
    super(`Unknown execution capability: ${capabilityKey}`);
    this.name = "ExecutionCapabilityNotFoundError";
  }
}
