# ARCH-011 (supplement) · System Admin — Audit Viewer

**Parent:** [011-system-admin-enterprise-architecture.md](011-system-admin-enterprise-architecture.md)

**Package as-built supplement:** [`packages/features/system-admin/src/audit-viewer/audit-viewer.md`](../../packages/features/system-admin/src/audit-viewer/audit-viewer.md)

### 9.9 Audit Viewer

## Definition

Audit Viewer is the administrative evidence review surface. The Execution Kernel writes audit evidence; System Admin reviews it.

## Functional Requirements (SUC-001..030)

| Code | Requirement |
| ---- | ----------- |
| **SUC-001** | System shall allow authorized administrators to view the organization audit evidence catalog. |
| **SUC-002** | System shall support free-text search across actions, targets, summaries, and actors. |
| **SUC-003** | System shall filter audit events by actor identifier. |
| **SUC-004** | System shall filter audit events by action key. |
| **SUC-005** | System shall filter audit events by target type and target identifier. |
| **SUC-006** | System shall filter audit events by module key. |
| **SUC-007** | System shall filter audit events by created date range. |
| **SUC-008** | System shall paginate audit search results server-side. |
| **SUC-009** | System shall provide an audit event detail view with governed metadata. |
| **SUC-010** | System shall render evidence timelines for a target in chronological order. |
| **SUC-011** | System shall provide actor investigation links from event detail. |
| **SUC-012** | System shall provide target investigation links from event detail. |
| **SUC-013** | System shall provide module or capability investigation links from event detail. |
| **SUC-014** | System shall provide action investigation links from event detail. |
| **SUC-015** | System shall export audit evidence to CSV when export is authorized. |
| **SUC-016** | System shall export audit evidence to JSON when export is authorized. |
| **SUC-017** | System shall export audit evidence to XLSX when export is authorized. |
| **SUC-018** | System shall export audit evidence to PDF when export is authorized. |
| **SUC-019** | System shall write audit evidence when exports are generated. |
| **SUC-020** | System shall redact sensitive metadata keys before display and export. |
| **SUC-021** | System shall scope all audit queries to the server-derived organization context. |
| **SUC-022** | System shall treat audit evidence as read-only in Audit Viewer. |
| **SUC-023** | System shall surface audit coverage gaps for enabled capabilities. |
| **SUC-024** | System shall display retention policy posture for the organization. |
| **SUC-025** | System shall allow authorized reviewers to update retention policies with audited outcomes. |
| **SUC-026** | System shall enforce `system-admin.audit.read`, `system-admin.audit.export`, and `system-admin.audit.review` server-side. |
| **SUC-027** | System shall render the audit catalog through governed Pattern C list metadata. |
| **SUC-028** | System shall record audit viewer list and detail view events without spamming paginated list pages. |
| **SUC-029** | System shall expose policy and approval correlation references when present in event metadata. |
| **SUC-030** | System shall not expose delete or mutation paths for historical audit log records through Audit Viewer. |

Implementation coverage registry: `packages/features/system-admin/src/audit-viewer/data/system-admin.audit-viewer.coverage.shared.ts`

Acceptance tests: `packages/features/system-admin/tests/unit/system-admin.audit-viewer.acceptance.test.ts`

## Enterprise Acceptance Criteria

| No. | Acceptance Criteria |
| --: | ------------------- |
| 1 | Authorized administrators can search and review audit evidence through a governed list surface. |
| 2 | Server-side filters support actor, action, target, module, and date range without client-side trust. |
| 3 | Pagination preserves filter state and returns organization-scoped result windows. |
| 4 | Audit event detail shows redacted metadata and operational context for investigators. |
| 5 | Target evidence timelines render chronologically for the selected record. |
| 6 | Investigation links open filtered audit views for actor, target, module, and action contexts. |
| 7 | Authorized exporters can download CSV, JSON, XLSX, and PDF evidence bundles. |
| 8 | Export operations write audit events with actor, format, and filter metadata. |
| 9 | Sensitive metadata keys are redacted before display and export. |
| 10 | All reads and exports derive organization context from server session, not client input. |
| 11 | Audit Viewer cannot modify or delete immutable audit log records. |
| 12 | Audit coverage gaps highlight capabilities missing declared audit mapping. |
| 13 | Retention policies are visible and updatable only with `system-admin.audit.review`. |
| 14 | Policy and approval references appear on detail when encoded in event metadata. |
| 15 | Catalog and detail views emit audit evidence without recording every paginated list page. |
| 16 | Retention updates and exports emit audit events with actor and target metadata. |
| 17 | Audit list surfaces declare ERP permission metadata through governed Pattern C. |
| 18 | Coverage and correlation views connect Audit Viewer to Capabilities and Diagnostics. |

## Route

`/system-admin/audit` — adapter: `apps/erp/src/lib/system-admin-sections/audit.server.tsx`
