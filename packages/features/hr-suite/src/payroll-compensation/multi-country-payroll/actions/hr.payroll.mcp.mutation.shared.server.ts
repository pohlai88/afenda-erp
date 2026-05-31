import { revalidatePath } from "next/cache";

import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

import { hrMcpRoutePaths } from "../contracts/hr.payroll.mcp-route.contract";
import { toHrMcpActionFailure } from "../data/hr.payroll.mcp-action-result.shared";

export { toHrMcpActionFailure } from "../data/hr.payroll.mcp-action-result.shared";

export async function finalizeHrMcpMutation(
  mutate: () => Promise<void>,
): Promise<ActionResult> {
  try {
    await mutate();
  } catch (error) {
    return toHrMcpActionFailure(error);
  }

  revalidatePath(hrMcpRoutePaths.multiCountryPayroll);
  return actionSuccess(undefined);
}
