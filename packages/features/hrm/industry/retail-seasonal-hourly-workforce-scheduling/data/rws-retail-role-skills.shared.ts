import type { HrmRwsRetailRole } from "../schemas/rws-workflow-state.shared"

/**
 * Optional competency skill code substrings required for a retail role.
 * When empty, role pickup does not enforce org skill catalog matching.
 */
export const RWS_RETAIL_ROLE_SKILL_CODE_HINTS: Readonly<
  Partial<Record<HrmRwsRetailRole, readonly string[]>>
> = {
  cashier: ["CASHIER", "POS", "RETAIL_CASH"],
  supervisor: ["SUPERVISOR", "SHIFT_LEAD", "TEAM_LEAD"],
  key_holder: ["KEY", "KEYHOLDER", "KEY_HOLDER"],
  sales_associate: ["SALES", "RETAIL_SALES"],
  stockroom: ["STOCK", "INVENTORY", "WAREHOUSE"],
  visual_merchandising: ["VISUAL", "VM", "MERCHANDIS"],
}

export function formatRwsRetailRoleSkillGapMessage(input: {
  retailRole: HrmRwsRetailRole
  missingHints: readonly string[]
}): string {
  const hints = input.missingHints.join(", ")
  return `Employee does not hold a required skill for role "${input.retailRole}" (${hints}). Assign training or pick another employee.`
}
