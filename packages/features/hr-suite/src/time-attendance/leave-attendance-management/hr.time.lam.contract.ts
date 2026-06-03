/** ERP permission objects for LAM governed surfaces. */
export const hrTimeLamReadPermission = {
  module: "hr",
  object: "leave",
  function: "read",
} as const;

export const hrTimeLamWritePermission = {
  module: "hr",
  object: "leave",
  function: "update",
} as const;

export const hrTimeLamAttendanceReadPermission = {
  module: "hr",
  object: "attendance",
  function: "read",
} as const;

export const hrTimeLamAttendanceWritePermission = {
  module: "hr",
  object: "attendance",
  function: "update",
} as const;
