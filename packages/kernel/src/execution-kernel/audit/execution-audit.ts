import type { AfendaTransaction } from "@afenda/db";
import type { WriteExecutionAuditEventInput as ExecutionAuditEvent } from "./execution-audit.types";
import { resolveExecutionAuditEntityType } from "./execution-audit-7w1h";
import {
  createExecutionAuditEvent,
  insertExecutionAuditEvent,
} from "./execution-audit-repository.server";

export type {
  AuditDiff,
  ExecutionAuditActorType,
  ExecutionAuditChannel,
  ExecutionAuditOutcome,
  ExecutionAuditEvent,
  NormalizedExecutionAuditEvent,
  WriteExecutionAuditEventInput,
} from "./execution-audit.types";
export { buildExecutionAuditDiff } from "./execution-audit-diff";
export {
  buildExecutionAuditDbInput,
  normalizeExecutionAuditEvent,
} from "./execution-audit-7w1h";
export { executionAuditEventSchema } from "./execution-audit.schema";
export { redactExecutionAuditRecord } from "./execution-audit-redaction";
export { resolveExecutionAuditEntityType };

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
