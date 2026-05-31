import { revalidatePath } from "next/cache";

import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

import { hrCpmRoutePaths } from "../contracts/hr.payroll.cpm-route.contract";
import { toHrCpmActionFailure } from "../data/hr.payroll.cpm-action-result.shared";

export { toHrCpmActionFailure } from "../data/hr.payroll.cpm-action-result.shared";

export async function finalizeHrCpmMutation(
  mutate: () => Promise<void>,
): Promise<ActionResult> {
  try {
    await mutate();
  } catch (error) {
    return toHrCpmActionFailure(error);
  }

  revalidatePath(hrCpmRoutePaths.compensationPlanning);
  return actionSuccess(undefined);
}
