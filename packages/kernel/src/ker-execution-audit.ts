import type { AfendaTransaction } from "@afenda/db";
import type { WriteExecutionAuditEventInput } from "./ker-execution-audit-types";
import { resolveExecutionAuditEntityType } from "./ker-execution-audit-7w1h";
import {
  createExecutionAuditEvent,
  insertExecutionAuditEvent,
} from "./ker-execution-audit-repository-server";

export type {
  AuditDiff,
  ExecutionAuditActorType,
  ExecutionAuditChannel,
  ExecutionAuditOutcome,
  NormalizedExecutionAuditEvent,
  WriteExecutionAuditEventInput,
} from "./ker-execution-audit-types";
export { buildExecutionAuditDiff } from "./ker-execution-audit-diff";
export {
  buildExecutionAuditDbInput,
  normalizeExecutionAuditEvent,
} from "./ker-execution-audit-7w1h";
export { executionAuditEventSchema } from "./ker-execution-audit-schema";
export { redactExecutionAuditRecord } from "./ker-execution-audit-redaction";
export { resolveExecutionAuditEntityType };

export type ExecutionAuditEvent = WriteExecutionAuditEventInput;
export type ExecutionAuditInput = ExecutionAuditEvent;

export async function writeExecutionAuditEvent(input: ExecutionAuditEvent) {
  await createExecutionAuditEvent(input);
}

/** Persist audit in the same Postgres transaction as the domain mutation. */
export async function writeExecutionAuditEventInTransaction(
  db: AfendaTransaction,
  input: ExecutionAuditEvent,
) {
  await insertExecutionAuditEvent(db, input);
}
