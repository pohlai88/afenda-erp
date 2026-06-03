import {
  createAuditLog,
  insertAuditLog,
  type AfendaTransaction,
} from "@afenda/db";
import {
  buildExecutionAuditDbInput,
  normalizeExecutionAuditEvent,
} from "./execution-audit-7w1h";
import type {
  ExecutionAuditEvent,
} from "./execution-audit.types";

export async function createExecutionAuditEvent(input: ExecutionAuditEvent) {
  await createAuditLog(
    buildExecutionAuditDbInput(normalizeExecutionAuditEvent(input)),
  );
}

export async function insertExecutionAuditEvent(
  db: AfendaTransaction,
  input: ExecutionAuditEvent,
) {
  await insertAuditLog(
    db,
    buildExecutionAuditDbInput(normalizeExecutionAuditEvent(input)),
  );
}
