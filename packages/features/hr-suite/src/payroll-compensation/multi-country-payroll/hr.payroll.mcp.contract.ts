export const hrPayrollMcpReadPermission = {
  module: "hr",
  object: "mcp",
  function: "read",
} as const;

export const hrPayrollMcpWritePermission = {
  module: "hr",
  object: "mcp",
  function: "write",
} as const;

export const hrPayrollMcpAdminPermission = {
  module: "hr",
  object: "mcp",
  function: "admin",
} as const;

export const hrPayrollMcpAuditReadPermission = {
  module: "hr",
  object: "mcp",
  function: "audit.read",
} as const;

export type HrPayrollMcpActionResult<TData = unknown> =
  | { ok: true; data: TData }
  | { ok: false; error: string; code?: string };

export type HrPayrollMcpListQuery = {
  countryConfigId?: string;
  legalEntitySetupId?: string;
  active?: boolean;
  limit?: number;
  cursor?: string | null;
};
