/** ERP permission object for employee records read surfaces. */
export const hrWorkforceRecordsReadPermission = {
  module: "hr",
  object: "employees",
  function: "read",
} as const;

export const hrWorkforceRecordsWritePermission = {
  module: "hr",
  object: "employees",
  function: "update",
} as const;

export const hrWorkforceRecordsSensitiveReadPermission = {
  module: "hr",
  object: "employees",
  function: "read",
} as const;
