import "server-only"

import { and, asc, eq, inArray } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmFhcHealthCertificate,
} from "@afenda/platform/db/schema"

import { redactFhcHealthCertificateRef } from "./fhc-health-redaction.shared"
import type { FhcHealthRecordRow } from "./fhc.types.shared"

export type { FhcHealthRecordRow } from "./fhc.types.shared"

export async function listFhcHealthRecordsForOrg(input: {
  organizationId: string
  canReadHealthDetails: boolean
}): Promise<readonly FhcHealthRecordRow[]> {
  const certificates = await db.query.hrmFhcHealthCertificate.findMany({
    where: eq(hrmFhcHealthCertificate.organizationId, input.organizationId),
    orderBy: [asc(hrmFhcHealthCertificate.expiresAt)],
  })
  if (certificates.length === 0) return []

  const employeeIds = [...new Set(certificates.map((row) => row.employeeId))]
  const employees = await db
    .select({
      id: hrmEmployee.id,
      legalName: hrmEmployee.legalName,
      preferredName: hrmEmployee.preferredName,
    })
    .from(hrmEmployee)
    .where(
      and(
        eq(hrmEmployee.organizationId, input.organizationId),
        inArray(hrmEmployee.id, employeeIds)
      )
    )

  const employeeMap = new Map(
    employees.map((row) => [row.id, row.preferredName?.trim() || row.legalName])
  )

  return certificates.map((cert) => ({
    id: cert.id,
    obligationId: cert.obligationId,
    employeeId: cert.employeeId,
    employeeLabel: employeeMap.get(cert.employeeId) ?? cert.employeeId,
    healthStatus: cert.healthStatus,
    renewalState: cert.renewalState,
    issuedAt: cert.issuedAt,
    expiresAt: cert.expiresAt,
    certificateRefDisplay: redactFhcHealthCertificateRef(
      cert.certificateRef,
      input.canReadHealthDetails
    ),
  }))
}
