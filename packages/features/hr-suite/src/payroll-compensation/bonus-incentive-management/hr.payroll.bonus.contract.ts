import {
  HR_BONUS_READ_CAPABILITY,
  HR_BONUS_WRITE_CAPABILITY,
} from "./hr.payroll.bonus-constants.shared";

export const hrPayrollBonusReadPermission = {
  module: "hr",
  object: "bonus",
  function: "read",
} as const;

export const hrPayrollBonusWritePermission = {
  module: "hr",
  object: "bonus",
  function: "write",
} as const;

export { HR_BONUS_READ_CAPABILITY, HR_BONUS_WRITE_CAPABILITY };
