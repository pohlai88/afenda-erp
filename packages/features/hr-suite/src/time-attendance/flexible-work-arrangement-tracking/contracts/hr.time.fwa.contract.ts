/** ERP permission objects for FWA governed surfaces (HRM-FWA-031). */
export const hrTimeFwaReadPermission = {
  module: "hr",
  object: "fwa",
  function: "read",
} as const;

export const hrTimeFwaWritePermission = {
  module: "hr",
  object: "fwa",
  function: "update",
} as const;

export const hrTimeFwaComplianceReadPermission = {
  module: "hr",
  object: "compliance",
  function: "read",
} as const;

export const hrTimeFwaPayrollReadPermission = {
  module: "hr",
  object: "attendance",
  function: "read",
} as const;
