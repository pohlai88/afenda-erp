import React from "react";

import {
  HrBonusAccessDeniedPanel,
  HrBonusWorkbenchSection,
} from "./components/hr.payroll.bonus-section.component.server";
import { buildHrBonusPageModel } from "./data/hr.payroll.bonus.page-model.server";
import { toHrBonusPageModelInput } from "./data/hr.payroll.bonus-search-params.parse.shared";
import { requireHrBonusRead } from "./policies/hr.payroll.bonus-access.policy.server";

export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";

export {
  buildHrBonusPageModel,
  type HrBonusPageModel,
  type HrBonusPageModelInput,
} from "./data/hr.payroll.bonus.page-model.server";

export {
  requireHrBonusRead,
  requireHrBonusWrite,
  requireHrBonusApprove,
} from "./policies/hr.payroll.bonus-access.policy.server";

export { toHrBonusPageModelInput } from "./data/hr.payroll.bonus-search-params.parse.shared";

export { HrBonusAccessDeniedPanel, HrBonusWorkbenchSection };

export { HrBonusAccessDeniedPanel as HrBonusAccessDenied };

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export async function renderHrBonusPage(searchParams?: HrSearchParamsInput) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  try {
    const guard = await requireHrBonusRead();
    const pageModel = await buildHrBonusPageModel(
      toHrBonusPageModelInput({
        organizationId: guard.organization.id,
        canWrite: guard.hasCapability("hr.bonus.write"),
        searchParams: resolvedSearchParams,
      }),
    );

    return React.createElement(HrBonusWorkbenchSection, { pageModel });
  } catch {
    return React.createElement(HrBonusAccessDeniedPanel);
  }
}
