export const hrWorkforceComplianceReadPermission = {
  module: "hr",
  object: "compliance",
  function: "read",
} as const;

export const hrWorkforceComplianceWritePermission = {
  module: "hr",
  object: "compliance",
  function: "write",
} as const;

export const hrWorkforceComplianceSensitiveReadPermission = {
  module: "hr",
  object: "compliance",
  function: "sensitive.read",
} as const;
