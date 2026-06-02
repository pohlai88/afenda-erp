import React from "react";

import { SectionPanel } from "@afenda/ui";

import {
  buildHrBenefitsPageModel,
} from "./data/hr.payroll.benefits.page-model.server";
import { toHrBenefitsPageModelInput } from "./data/hr.payroll.benefits-search-params.parse.shared";
import {
  HrBenefitsAccessDeniedPanel,
  HrBenefitsWorkbenchSection,
} from "./components/hr.payroll.benefits-section.component.server";
import { requireHrBenefitsRead } from "./policies/hr.payroll.benefits-access.policy.server";

export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";

export { HrBenefitsAccessDeniedPanel, HrBenefitsWorkbenchSection };

export function HrBenefitsAccessDenied() {
  return React.createElement(HrBenefitsAccessDeniedPanel);
}

export function HrBenefitsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return React.createElement(
    SectionPanel,
    { headingLevel: 2, title, description },
    children,
  );
}

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export async function renderHrBenefitsPage(searchParams?: HrSearchParamsInput) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  try {
    const guard = await requireHrBenefitsRead();
    const canWrite = guard.hasCapability("hr.benefits.write");
    const pageModel = await buildHrBenefitsPageModel(
      toHrBenefitsPageModelInput({
        organizationId: guard.organization.id,
        canWrite,
        canViewSensitive: guard.canViewSensitive,
        searchParams: resolvedSearchParams,
      }),
    );

    return React.createElement(HrBenefitsWorkbenchSection, {
      pageModel,
      canWrite,
    });
  } catch {
    return React.createElement(HrBenefitsAccessDeniedPanel);
  }
}
