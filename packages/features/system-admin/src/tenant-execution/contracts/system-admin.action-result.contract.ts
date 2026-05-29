import {
  actionFailure,
  actionSuccess,
  assertFormActionResult,
  toVoidFormAction,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

export type SystemAdminActionResult<T = void> = ActionResult<T>;

export const systemAdminActionSuccess = actionSuccess;

export const systemAdminActionFailure = actionFailure;

export { zodActionFailure };

export const assertSystemAdminFormActionResult = assertFormActionResult;

export const toSystemAdminVoidFormAction = toVoidFormAction;
