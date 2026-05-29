# HR Workforce — Document Management

Vertical supplement for **ARCH-010** (HR feature package) and **Slice 2** in `docs/roadmap/004-hrm-migration.md`.

Legacy source: `afenda-vercel` → `packages/features/hrm/employee-management/src/documents-management`.

## Definition

Stores, organizes, and controls employee-related HR documents with verification, expiry, requirements, and audit — without owning blob storage or payroll/compliance workflow engines.

## Migrated (ERP)

| Capability | Location |
| ---------- | -------- |
| Document register (metadata + blob URL) | `actions/hr-documents.actions.server.ts`, `registerHrEmployeeDocument` |
| Effective from / expires on | Register schema + form; `hr_employee_documents.effective_*` |
| Verification (pending → verified / rejected) | `verifyHrEmployeeDocument`, `rejectHrEmployeeDocument` + forms |
| Rejection reason (HRM-DOC-010) | `rejection_reason` column + reject form |
| Archive / lifecycle | `archiveHrEmployeeDocument`, `lifecycle_status` |
| Document requirements by employment status | `hr_document_requirements`, upsert action + UI |
| Governed Pattern C list (server window) | `surface/hr-documents-list.surface.ts` |
| Execution permissions | `hr.documents.read`, `hr.documents.write` |
| Execution audit events | `events/hr-documents.event.ts` + `writeExecutionAuditEvent` |
| Expiry sweep (archive past `effective_to`) | `runHrDocumentExpirySweep` in `@afenda/db`; cron `GET /api/cron/hr-document-expiry` |
| App route | `/hr/documents` → `apps/erp/src/lib/hr-sections/documents.server.tsx` |

## Deferred

| Legacy / requirement | Reason |
| -------------------- | ------ |
| Blob upload UI, governed path validation, Vercel Blob integration | Storage door not wired in ERP; register accepts HTTPS blob URL only |
| Document versioning (`documentSetId`, replace/supersede) | Schema slice 2a is single-row vault; no `version_number` / chain |
| Tiered expiry watch audits (30d / 14d / 7d) | Legacy `document-expiry-watch`; ERP uses sweep-only archival |
| `verificationStatus: expired` separate from archive | ERP archives on sweep; no distinct expired verification enum |
| Download action + per-download audit | No secure download gate in feature-hr yet |
| Soft delete, retention policies, legal entity on document | Not in `hr_employee_documents` schema |
| Draft contract link on attach | Contracts vertical deferred |
| Bulk import, e-sign, vault ACLs, ESS submit | Out of slice 2a scope |
| Mandatory-document gap detection UI | Requirements stored; employee readiness matrix deferred |

## Boundaries

- **Employee master** → `workforce/employees`
- **Compliance obligations / exceptions** → `workforce/compliance` (may reference documents as evidence later)
- **Physical schema** → `packages/db/src/schema/hr.ts`, commands → `packages/db/src/hr-documents.ts`

## Verification

```bash
pnpm exec tsc -p packages/db/tsconfig.build.json --noEmit
pnpm exec tsc -p packages/features/hr/tsconfig.build.json --noEmit
pnpm --filter @afenda/feature-hr test -- documents
```
