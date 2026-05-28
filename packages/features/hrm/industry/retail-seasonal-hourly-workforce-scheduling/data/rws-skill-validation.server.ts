import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmEmployeeSkill, hrmSkill } from "@afenda/platform/db/schema"

import type { HrmRwsRetailRole } from "../schemas/rws-workflow-state.shared"
import {
  formatRwsRetailRoleSkillGapMessage,
  RWS_RETAIL_ROLE_SKILL_CODE_HINTS,
} from "./rws-retail-role-skills.shared"

export async function validateRwsEmployeeRetailRoleSkills(input: {
  organizationId: string
  employeeId: string
  retailRole: HrmRwsRetailRole
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const hints = RWS_RETAIL_ROLE_SKILL_CODE_HINTS[input.retailRole]
  if (!hints || hints.length === 0) {
    return { ok: true }
  }

  const skillRows = await db
    .select({ code: hrmSkill.code })
    .from(hrmEmployeeSkill)
    .innerJoin(hrmSkill, eq(hrmEmployeeSkill.skillId, hrmSkill.id))
    .where(
      and(
        eq(hrmEmployeeSkill.organizationId, input.organizationId),
        eq(hrmEmployeeSkill.employeeId, input.employeeId)
      )
    )

  const heldCodes = skillRows.map((row) => row.code.toUpperCase())
  const missingHints = hints.filter((hint) =>
    heldCodes.every((code) => !code.includes(hint.toUpperCase()))
  )

  if (missingHints.length === hints.length) {
    return {
      ok: false,
      message: formatRwsRetailRoleSkillGapMessage({
        retailRole: input.retailRole,
        missingHints: hints,
      }),
    }
  }

  return { ok: true }
}
