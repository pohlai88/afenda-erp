import {
  listHrComplianceExceptionsWindow,
  listHrComplianceObligationsWindow,
  listHrDepartments,
  listHrEmployeeLaborLawRequirementsWindow,
  syncHrEmployeeLaborLawRequirements,
} from "@afenda/db";

import { buildHrComplianceExceptionsListSurface } from "../surface/hr.workforce.compliance-exceptions-list.surface";
import { buildHrComplianceLaborLawRequirementsListSurface } from "../surface/hr.workforce.compliance-labor-law-requirements-list.surface";
import { buildHrComplianceObligationsListSurface } from "../surface/hr.workforce.compliance-obligations-list.surface";

export type HrCompliancePageModelInput = {
  organizationId: string;
  canWrite: boolean;
  /** Applies to all lists when specific search params are omitted. */
  search?: string;
  obligationSearch?: string;
  exceptionSearch?: string;
  laborLawSearch?: string;
  obligationLimit?: number;
  exceptionLimit?: number;
  laborLawLimit?: number;
};

/** Department options for obligation scope pickers. Caller must enforce read access. */
export async function loadComplianceFormOptions(organizationId: string) {
  const departments = await listHrDepartments({ organizationId });
  return {
    departments: departments.map((department) => ({
      id: department.id,
      name: department.name,
    })),
  };
}

export async function buildHrCompliancePageModel(input: HrCompliancePageModelInput) {
  const obligationSearch = input.obligationSearch ?? input.search;
  const exceptionSearch = input.exceptionSearch ?? input.search;
  const laborLawSearch = input.laborLawSearch ?? input.search;

  const [obligations, exceptions, laborLawRequirements] = await Promise.all([
    listHrComplianceObligationsWindow({
      organizationId: input.organizationId,
      search: obligationSearch,
      limit: input.obligationLimit,
    }),
    listHrComplianceExceptionsWindow({
      organizationId: input.organizationId,
      search: exceptionSearch,
      openOnly: true,
      limit: input.exceptionLimit,
    }),
    syncHrEmployeeLaborLawRequirements({
      organizationId: input.organizationId,
    }).then(() =>
      listHrEmployeeLaborLawRequirementsWindow({
        organizationId: input.organizationId,
        search: laborLawSearch,
        limit: input.laborLawLimit,
      }),
    ),
  ]);

  return {
    canWrite: input.canWrite,
    obligationsList: buildHrComplianceObligationsListSurface({
      window: obligations,
      searchValue: obligationSearch,
      canWrite: input.canWrite,
    }),
    exceptionsList: buildHrComplianceExceptionsListSurface({
      window: exceptions,
      searchValue: exceptionSearch,
      canWrite: input.canWrite,
    }),
    laborLawRequirementsList: buildHrComplianceLaborLawRequirementsListSurface({
      window: laborLawRequirements,
      searchValue: laborLawSearch,
      canWrite: input.canWrite,
    }),
  };
}

export type HrCompliancePageModel = Awaited<
  ReturnType<typeof buildHrCompliancePageModel>
>;
