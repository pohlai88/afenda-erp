export type RecomputeMscObligationsFormState =
  | { ok: true; created: number; updated: number; removed: number }
  | { ok: false; errors: { form?: string } }

export type CreateMscRequirementRuleFormState =
  | { ok: true; ruleId: string }
  | { ok: false; errors: { form?: string } }

export type CreateMscSiteFormState =
  | { ok: true; siteId: string }
  | { ok: false; errors: { form?: string } }

export type CreateMscMachineFormState =
  | { ok: true; machineId: string }
  | { ok: false; errors: { form?: string } }

export type RecordMscTrainingFormState =
  | { ok: true }
  | { ok: false; errors: { form?: string } }

export type RecordMscCertificationFormState =
  | { ok: true; certificationId: string }
  | { ok: false; errors: { form?: string } }

export type CreateMscHazardFormState =
  | { ok: true; assessmentId: string }
  | { ok: false; errors: { form?: string } }

export type CreateMscIncidentFormState =
  | { ok: true; incidentId: string }
  | { ok: false; errors: { form?: string } }

export type CreateMscCorrectiveFormState =
  | { ok: true; actionId: string }
  | { ok: false; errors: { form?: string } }

export type LinkMscEvidenceFormState =
  | { ok: true; linkId: string }
  | { ok: false; errors: { form?: string } }

export type CreateMscRegulatoryReferenceFormState =
  | { ok: true; referenceId: string }
  | { ok: false; errors: { form?: string } }

export type CreateMscWorkRestrictionFormState =
  | { ok: true; restrictionId: string }
  | { ok: false; errors: { form?: string } }

export type ExportMscReportFormState =
  | { ok: true; csv: string; filename: string; rowCount: number }
  | { ok: false; errors: { form?: string } }

export type EmitMscExpiryAlertsFormState =
  | {
      ok: true
      emittedInApp: number
      emittedEmail: number
      skipped: number
    }
  | { ok: false; errors: { form?: string } }
