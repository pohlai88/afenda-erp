import "server-only"

import { and, desc, eq, isNull } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmEmployeeEmergencyContact } from "@afenda/platform/db/schema"

import type { EmergencyContactRow } from "@afenda/feature-hrm-core/shared"

/** Active (non-archived) emergency contacts ordered primary-first. */
export async function listEmergencyContactsForEmployee(
  organizationId: string,
  employeeId: string
): Promise<EmergencyContactRow[]> {
  return db
    .select({
      id: hrmEmployeeEmergencyContact.id,
      legalName: hrmEmployeeEmergencyContact.legalName,
      relationship: hrmEmployeeEmergencyContact.relationship,
      phone: hrmEmployeeEmergencyContact.phone,
      alternatePhone: hrmEmployeeEmergencyContact.alternatePhone,
      email: hrmEmployeeEmergencyContact.email,
      isPrimary: hrmEmployeeEmergencyContact.isPrimary,
    })
    .from(hrmEmployeeEmergencyContact)
    .where(
      and(
        eq(hrmEmployeeEmergencyContact.organizationId, organizationId),
        eq(hrmEmployeeEmergencyContact.employeeId, employeeId),
        isNull(hrmEmployeeEmergencyContact.archivedAt)
      )
    )
    .orderBy(desc(hrmEmployeeEmergencyContact.isPrimary))
}
