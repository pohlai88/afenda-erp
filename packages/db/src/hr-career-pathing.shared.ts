import { and, eq } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { hrEmployees } from "./hr";
import {
  hrmCareerPathFrameworks,
  hrmDevelopmentGoals,
  hrmDevelopmentPlans,
} from "./hr-career-pathing";

export class HrCareerPathingCommandError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "HrCareerPathingCommandError";
    this.code = code;
  }
}

export async function assertEmployeeInOrg(
  db: AfendaTransaction,
  organizationId: string,
  employeeId: string,
) {
  const [employee] = await db
    .select({ id: hrEmployees.id })
    .from(hrEmployees)
    .where(
      and(
        eq(hrEmployees.organizationId, organizationId),
        eq(hrEmployees.id, employeeId),
      ),
    )
    .limit(1);

  if (!employee) {
    throw new HrCareerPathingCommandError("employee_not_found", "Employee not found.");
  }
}

export async function assertFrameworkInOrg(
  db: AfendaTransaction,
  organizationId: string,
  frameworkId: string,
) {
  const [framework] = await db
    .select({ id: hrmCareerPathFrameworks.id })
    .from(hrmCareerPathFrameworks)
    .where(
      and(
        eq(hrmCareerPathFrameworks.organizationId, organizationId),
        eq(hrmCareerPathFrameworks.id, frameworkId),
      ),
    )
    .limit(1);

  if (!framework) {
    throw new HrCareerPathingCommandError(
      "framework_not_found",
      "Career path framework not found.",
    );
  }
}

export async function assertPlanInOrg(
  db: AfendaTransaction,
  organizationId: string,
  planId: string,
) {
  const [plan] = await db
    .select({ id: hrmDevelopmentPlans.id })
    .from(hrmDevelopmentPlans)
    .where(
      and(
        eq(hrmDevelopmentPlans.organizationId, organizationId),
        eq(hrmDevelopmentPlans.id, planId),
      ),
    )
    .limit(1);

  if (!plan) {
    throw new HrCareerPathingCommandError(
      "development_plan_not_found",
      "Development plan not found.",
    );
  }
}

export async function assertGoalInOrg(
  db: AfendaTransaction,
  organizationId: string,
  goalId: string,
) {
  const [goal] = await db
    .select({ id: hrmDevelopmentGoals.id })
    .from(hrmDevelopmentGoals)
    .where(
      and(
        eq(hrmDevelopmentGoals.organizationId, organizationId),
        eq(hrmDevelopmentGoals.id, goalId),
      ),
    )
    .limit(1);

  if (!goal) {
    throw new HrCareerPathingCommandError("goal_not_found", "Development goal not found.");
  }
}
