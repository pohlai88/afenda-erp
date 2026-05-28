export const executionStates = [
  "detected",
  "owned",
  "blocked",
  "resolving",
  "ready_to_release",
  "released",
  "resolved",
  "deprecated",
] as const;

export type ExecutionState = (typeof executionStates)[number];

const executionStateSet = new Set<string>(executionStates);

export function isExecutionState(value: string): value is ExecutionState {
  return executionStateSet.has(value);
}
