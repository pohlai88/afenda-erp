/** ERP permission object for offboarding read surfaces. */
export const hrWorkforceOffboardingReadPermission = {
  module: "hr",
  object: "offboarding",
  function: "read",
} as const;

export const hrWorkforceOffboardingWritePermission = {
  module: "hr",
  object: "offboarding",
  function: "update",
} as const;
