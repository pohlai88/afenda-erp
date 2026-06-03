export const hrPayrollSbsReadPermission = {
  module: "hr",
  object: "sbs",
  function: "read",
} as const;

export const hrPayrollSbsWritePermission = {
  module: "hr",
  object: "sbs",
  function: "write",
} as const;

export const hrPayrollSbsApprovePermission = {
  module: "hr",
  object: "sbs",
  function: "approve",
} as const;

export const HR_SBS_READ_CAPABILITY = "hr.sbs.read" as const;
export const HR_SBS_WRITE_CAPABILITY = "hr.sbs.write" as const;
export const HR_SBS_APPROVE_CAPABILITY = "hr.sbs.approve" as const;
