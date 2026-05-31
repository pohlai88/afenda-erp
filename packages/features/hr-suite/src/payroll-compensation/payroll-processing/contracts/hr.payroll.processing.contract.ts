export const hrPayrollProcessingReadPermission = {
  module: "hr",
  object: "payroll",
  function: "read",
} as const;

export const hrPayrollProcessingWritePermission = {
  module: "hr",
  object: "payroll",
  function: "write",
} as const;

export const hrPayrollProcessingApprovePermission = {
  module: "hr",
  object: "payroll",
  function: "approve",
} as const;

export const hrPayrollProcessingAuditReadPermission = {
  module: "hr",
  object: "payroll",
  function: "audit_read",
} as const;

export const hrPayrollProcessingEssReadPermission = {
  module: "hr",
  object: "payroll",
  function: "ess_read",
} as const;
