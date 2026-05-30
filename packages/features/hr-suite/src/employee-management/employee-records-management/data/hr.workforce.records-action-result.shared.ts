import { HrEmployeeCommandError } from "@afenda/db";
import {
  actionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

export function toRecordsActionFailure(error: unknown): ActionResult {
  if (error instanceof HrEmployeeCommandError) {
    switch (error.code) {
      case "duplicate_employee_number":
        return actionFailure("An employee with this number already exists.");
      case "duplicate_email":
        return actionFailure("An employee with this email already exists.");
      case "duplicate_identity_number":
        return actionFailure("An employee with this identity number already exists.");
      case "duplicate_phone":
        return actionFailure("An employee with this phone number already exists.");
      case "employee_archived":
        return actionFailure("This employee record is archived.");
      case "employee_not_found":
        return actionFailure("Employee record was not found.");
      default:
        return actionFailure("Employee record could not be saved.");
    }
  }

  return actionFailure("Employee record could not be saved.");
}
