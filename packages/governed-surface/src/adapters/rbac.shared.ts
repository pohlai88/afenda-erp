export const ERP_FUNCTIONS = [
  "create",
  "read",
  "update",
  "delete",
  "search",
  "audit",
  "predict",
] as const;

export type ErpFunction = (typeof ERP_FUNCTIONS)[number];

export type ErpPermissionTuple = {
  readonly module: string;
  readonly object: string;
  readonly function: ErpFunction;
};
