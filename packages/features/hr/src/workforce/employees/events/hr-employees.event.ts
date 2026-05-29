export const hrEmployeeAuditActions = {
  create: "hr.workforce.employee.create",
  update: "hr.workforce.employee.update",
  archive: "hr.workforce.employee.archive",
  assignmentUpsert: "hr.workforce.employee.assignment.upsert",
} as const;

export type HrEmployeeAuditAction =
  (typeof hrEmployeeAuditActions)[keyof typeof hrEmployeeAuditActions];
