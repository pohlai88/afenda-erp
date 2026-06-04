import { defineHrSuiteReadPermission } from "../../hr-suite-integration";

export const __IDENTIFIER_CAMEL__ReadPermission =
  defineHrSuiteReadPermission("__DOMAIN_TAIL__");

export type __IDENTIFIER__ListCellValue = string | number | boolean | null;

export type __IDENTIFIER__ListRow = {
  readonly id: string;
  readonly cells: Record<string, __IDENTIFIER__ListCellValue>;
  readonly rowHref?: string;
  readonly rowTone?: "attention" | "critical";
};
