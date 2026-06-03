import type { ActionResult } from "@afenda/governed-surface/schemas";
import { HrOrgCommandError } from "@afenda/db";

export function toOrgActionFailure(error: unknown): ActionResult {
  if (error instanceof HrOrgCommandError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }
  return { ok: false, error: "Organization structure action failed." };
}
