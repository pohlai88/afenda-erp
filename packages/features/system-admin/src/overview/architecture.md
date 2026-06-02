# System Admin

Parent doctrine:
[ARCH-1006 System Admin](../../../../../docs/architecture/1006-control-plane.md),
[ARCH-1006 Data Management](../../../../../docs/architecture/1006-control-plane.md),
[ARCH-1002 Execution Kernel](../../../../../docs/architecture/1002-backend.md),
[ARCH-1005 Workspace Package Discipline](../../../../../docs/architecture/1005-infrastructure.md).

## Definition

**System Admin is the ERP function that configures, reviews, evidences, and
operates organization-level administrative controls across identity, access,
modules, policies, approvals, audit, security, organization settings,
integrations, data movement, diagnostics, reliability, billing impact, and Lynx
governance.**

`@afenda/feature-system-admin` is the local enterprise control-plane package.
It owns administrative behavior and governed surfaces for organization-scoped
governance, but it does not own runtime execution enforcement, physical schema
migrations, or app route composition.

---

# System Admin Includes

| Area | Local home |
| ---- | ---------- |
| **Admin Hub** | `overview/` |
| **User Governance** | `users/` |
| **Membership Governance** | `memberships/` |
| **Role Governance** | `roles/` |
| **Permission Governance** | `permissions/` |
| **Capability Governance** | `capabilities/` |
| **Module Administration** | `modules/` |
| **Policy Configuration** | `policies/` |
| **Approval Administration** | `approvals/` |
| **Audit Viewer** | `audit-viewer/` |
| **Security Administration** | `security/` |
| **Organization Configuration** | `organization/` |
| **Integration Operations** | `integrations/` |
| **Data Management** | `data-management/` |
| **Diagnostics** | `diagnostics/` |
| **Reliability** | `reliability/` |
| **Billing and License Impact** | `billing/` |
| **Lynx Governance** | `lynx/` |
| **Execution Settings Bridge** | `tenant-execution/` |

---

# System Admin Does Not Include

| Excluded Area | Owned By |
| ------------- | -------- |
| Runtime execution verdicts | Execution Kernel in `@afenda/kernel` |
| Global authentication provider behavior | `@afenda/auth` and platform identity providers |
| App route composition and workspace shell | `apps/erp` |
| Feature-module business rules | Owning `@afenda/feature-*` package |
| Physical schema migrations | `@afenda/db` under ARCH-1005 |
| Long-running workflow engine | `@afenda/workflows` or future workflow runtime |
| Governed renderer kernel | `@afenda/governed-surface` |
| Shared UI primitives | `@afenda/ui` |
| Lynx product behavior and Knowledge substrate behavior | `@afenda/feature-lynx` and `@afenda/feature-knowledge` |

---

# System Admin Requirement Statement

| Requirement | Description |
| ----------- | ----------- |
| **System Admin** | Implements the package-local administrative control plane for configuring and reviewing users, memberships, roles, permissions, capabilities, modules, policies, approvals, audit evidence, security posture, organization settings, integrations, data movement, diagnostics, reliability, billing impact, and Lynx governance while delegating runtime enforcement to the Execution Kernel. |

---

# Enterprise Functional Requirements

| Code | Requirement | Local home |
| ---- | ----------- | ---------- |
| **SYS-ADM-001** | System shall provide a System Admin hub that summarizes administrative posture, recent changes, and attention items. | `overview/` |
| **SYS-ADM-002** | System shall support user invitation, resend, cancellation, activation, suspension, reactivation, removal, and status review. | `users/` |
| **SYS-ADM-003** | System shall support organization membership review, membership status changes, and membership role coverage. | `memberships/` |
| **SYS-ADM-004** | System shall support role catalog review, role creation, role update, role deprecation, and role diff evidence. | `roles/` |
| **SYS-ADM-005** | System shall support role assignment and role removal with actor, target, reason, and audit evidence. | `roles/`, `memberships/` |
| **SYS-ADM-006** | System shall maintain a permission catalog with risk levels, override visibility, and high-risk permission confirmation. | `permissions/` |
| **SYS-ADM-007** | System shall maintain a capability catalog with role coverage, module coverage, and runtime-readiness signals. | `capabilities/` |
| **SYS-ADM-008** | System shall support module enablement, disablement, visibility, dependency readiness, and rollout controls. | `modules/` |
| **SYS-ADM-009** | System shall support organization-scoped policy configuration with thresholds, locks, exceptions, and versioned rule changes. | `policies/`, `tenant-execution/` |
| **SYS-ADM-010** | System shall support approval chain configuration, escalation settings, delegation posture, and approval enablement. | `approvals/` |
| **SYS-ADM-011** | System shall provide audit search, filtering, detail review, retention review, coverage indicators, and evidence export. | `audit-viewer/` |
| **SYS-ADM-012** | System shall provide security posture controls for MFA, trusted domains, session policy, and sensitive action confirmation. | `security/` |
| **SYS-ADM-013** | System shall support organization settings for locale, timezone, fiscal calendar, numbering, data region, and zero-data-retention posture. | `organization/` |
| **SYS-ADM-014** | System shall support API credentials, webhook endpoints, SSO configuration, credential posture, and integration readiness. | `integrations/` |
| **SYS-ADM-015** | System shall support integration operations including endpoint ping, signing-key rotation, test payloads, resend, retry policy, and delivery history. | `integrations/`, `reliability/` |
| **SYS-ADM-016** | System shall support data import/export templates, upload intake, CSV/spreadsheet parsing, staged validation, and job creation. | `data-management/` |
| **SYS-ADM-017** | System shall support import job execution, row-level failure evidence, retry, cancellation, job history, and export evidence. | `data-management/` |
| **SYS-ADM-018** | System shall provide diagnostics for governance drift, missing audit coverage, disabled modules, stale invites, and configuration gaps. | `diagnostics/` |
| **SYS-ADM-019** | System shall provide reliability visibility for cron, queues, workflows, migrations, webhooks, cache, and storage health. | `reliability/` |
| **SYS-ADM-020** | System shall provide billing and entitlement visibility for subscriptions, invoices, plans, usage, and marketplace posture. | `billing/` |
| **SYS-ADM-021** | System shall show license and feature impact by role, module, capability, plan, and enabled feature. | `billing/`, `modules/`, `capabilities/`, `roles/` |
| **SYS-ADM-022** | System shall provide Lynx governance for usage, approvals, sandbox behavior, monitor controls, and machine-layer posture. | `lynx/` |
| **SYS-ADM-023** | System shall support access governance workflows including segregation-of-duties checks, toxic-combination detection, certification campaigns, and dormant-access cleanup. | `users/`, `memberships/`, `roles/`, `permissions/`, `security/` |
| **SYS-ADM-024** | System shall support configuration change governance with before/after diffs, approval hooks, scheduled activation, rollback history, and environment drift evidence. | `policies/`, `approvals/`, `modules/`, `organization/`, `security/` |
| **SYS-ADM-025** | System shall provide an operational exception center that consolidates failed webhooks, failed imports, stale invites, disabled modules, security gaps, and missing audit coverage. | `overview/`, `diagnostics/`, `reliability/`, `integrations/`, `data-management/` |
| **SYS-ADM-026** | System shall support just-in-time support access, break-glass administration, impersonation/session review, emergency access expiry, and mandatory audit evidence. | `security/`, `users/`, `roles/`, `audit-viewer/` |
| **SYS-ADM-027** | System shall derive organization context from server session or execution context and shall not trust client-supplied organization identifiers. | all server verticals |
| **SYS-ADM-028** | System shall re-check capabilities in Server Components, Server Actions, and Route Handlers before protected reads or mutations. | all server verticals |
| **SYS-ADM-029** | System shall render tenant lists through governed server-window surfaces and shall not ship full tenant datasets to the browser for pagination. | all surface verticals |
| **SYS-ADM-030** | System shall write audit evidence for sensitive admin changes, including role, permission, module, policy, integration, import, security, support-access, and organization-setting changes. | all mutating verticals |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria |
| --: | ------------------- |
| 1 | Admin hub displays organization posture, recent changes, and attention items for authorized administrators. |
| 2 | User invitation, resend, cancellation, suspension, reactivation, and removal actions are authorized and audited. |
| 3 | Administrators can explain why a user has access using memberships, roles, permissions, capabilities, and policy context. |
| 4 | Role creation, update, deprecation, assignment, and removal preserve role diff and assignment evidence. |
| 5 | High-risk permission and capability changes require explicit confirmation and write audit evidence. |
| 6 | Module enablement and disablement show readiness, dependency, and rollout impact before mutation. |
| 7 | Policy and approval changes preserve before/after configuration evidence and runtime linkage to the Execution Kernel. |
| 8 | Audit viewer can search, filter, inspect, and export evidence without exposing secrets or raw sensitive payloads. |
| 9 | Organization settings updates record actor, previous value, next value, activation timing, and rollback-relevant metadata. |
| 10 | Integration operators can rotate secrets, ping endpoints, send test payloads, resend deliveries, and inspect retry history. |
| 11 | Data import jobs validate staged rows, expose row-level failures, support retry/cancel, and preserve job history. |
| 12 | Import and export evidence never stores raw CSV bodies, secrets, full payroll values, statutory payloads, or full PII rows. |
| 13 | Diagnostics and reliability surfaces expose failed webhooks, failed imports, stale invites, disabled modules, drift, and missing audit coverage. |
| 14 | Support or break-glass access is time-bound, reviewed, and always audit-backed. |
| 15 | Billing and entitlement surfaces show role, module, capability, plan, feature, and license impact. |
| 16 | Lynx governance follows ARCH-1005 vocabulary, approvals, tool metadata, and machine-layer boundaries. |
| 17 | All protected System Admin reads and mutations derive `organizationId` from server context. |
| 18 | All protected System Admin actions re-check capabilities server-side before reading or mutating tenant data. |
| 19 | Governed list pages use server-window pagination, filtering, sorting, and redaction. |
| 20 | `apps/erp` routes remain thin adapters that call `@afenda/feature-system-admin` export doors. |

## Operating Model

```txt
System Admin configures and evidences administrative law.
Execution Kernel enforces protected execution.
Feature modules execute business behavior.
apps/erp composes routes and shell.
```

System Admin is server-first. Client components are only for focused editors,
forms, dialogs, and governed trailing actions.

## Public Doors

| Door | Owns |
| ---- | ---- |
| `.` | Environment-neutral route paths, navigation contracts, and shared types |
| `./client` | Client components, browser-safe catalogs, action result types |
| `./server` | Server components, page models, policies, actions, data access, server-only exports |
| `./metadata` | Surface keys, metadata-safe copy, governed list/stat builders |

`src/server.ts` is the server-only marker and imports `@afenda/kernel/server`.
Deep implementation files should not import `server-only` directly.

## Source Shape

System Admin uses vertical ownership. Do not add root implementation buckets.

```txt
src/
  index.ts
  client.ts
  server.ts
  metadata.ts
  overview/
  users/
  memberships/
  roles/
  permissions/
  modules/
  capabilities/
  policies/
  approvals/
  audit-viewer/
  security/
  organization/
  integrations/
  data-management/       # target enterprise import/export workbench
  diagnostics/
  reliability/
  billing/
  lynx/
  tenant-execution/      # bridge only, not a route
```

Forbidden root buckets:

```txt
src/actions/
src/components/
src/contracts/
src/data/
src/events/
src/schemas/
src/surface/
src/utils/
src/tools/
src/helpers/
src/common/
src/shared/
```

Each vertical owns its own implementation buckets when needed:

```txt
<vertical>/
  actions/
  components/
  contracts/
  data/
  events/
  policies/
  schemas/
  surface/
  tests/
  <vertical>-architecture.md
```

`tenant-execution/` is the exception. It is a wiring layer for organization
execution settings and must not grow route components or governed UI surfaces.

## Enterprise Development Pipeline

Every new System Admin capability follows this pipeline:

1. Update canonical doctrine in `docs/architecture/1006-control-plane.md` when the capability
   changes enterprise boundaries or control-plane meaning.
2. Update or create package-local architecture in the owning vertical.
3. Define contracts before UI: route paths, list rows, command inputs, result
   envelopes, permission keys, and audit actions.
4. Add schemas for every form/action input.
5. Add server policies that derive `organizationId` from session/execution
   context and re-check capability on the server.
6. Add `@afenda/db` commands/queries only when durable persistence is required;
   schema changes follow ARCH-1005 migration rules.
7. Build page models and bounded server windows.
8. Add server actions: validate, authorize, execute, audit, dispatch optional
   webhook, revalidate.
9. Add governed surfaces and focused client components.
10. Add thin app route adapters under `apps/erp/src/lib/system-admin-sections/`.
11. Add tests and update `file-audit.md`.

Do not start a vertical by adding a generic helper or a UI-only screen.
Enterprise admin work starts with authority, evidence, and failure semantics.

## Enterprise Gap Pipeline

| Gap | Owning local verticals | First implementation artifact |
| --- | ---------------------- | ----------------------------- |
| Access governance | `users/`, `memberships/`, `roles/`, `permissions/`, `capabilities/`, `security/` | SoD/access-review contracts and risk catalog |
| Data management / import workbench | `data-management/` | Import job contracts, CSV parser, adapter contract, job surfaces |
| Configuration change governance | `policies/`, `approvals/`, `modules/`, `capabilities/`, `organization/`, `security/` | Config diff contract and audit metadata standard |
| Operational exception center | `overview/`, `diagnostics/`, `reliability/`, `integrations/`, `data-management/` | Shared exception row contract and attention queue surface |
| Integration operations | `integrations/`, `reliability/`, `audit-viewer/` | Ping/rotate/resend action contracts |
| Support / break-glass governance | `security/`, `users/`, `roles/`, `audit-viewer/` | Emergency access policy and audit contract |
| License / feature / module impact | `billing/`, `modules/`, `capabilities/`, `roles/` | License impact contract by role/module/capability |

## Data Management Placement

Data Management is a first-class vertical, not a utility folder.

CSV/import artifacts belong here:

```txt
data-management/data/system-admin.data-management-csv.parse.shared.ts
data-management/contracts/system-admin.import-adapter.contract.ts
data-management/schemas/system-admin.import-job.schema.ts
data-management/data/system-admin.import-jobs.workflow.server.ts
```

Long-running execution may delegate to `@afenda/workflows`, but the System
Admin vertical owns operator controls, validation evidence, governed surfaces,
and audit behavior.

## Action Standard

Every sensitive action should follow this sequence:

```txt
1. Resolve execution/session context.
2. Parse and validate input with Zod.
3. Check the domain-specific System Admin permission.
4. Check policy when needed.
5. Execute through package/domain service.
6. Write execution audit evidence.
7. Dispatch webhook only after successful mutation when configured.
8. Revalidate affected System Admin surfaces.
9. Return SystemAdminActionResult.
```

Never trust `organizationId`, `role`, `userId`, or `membershipId` from client
input when server context can derive it.

## Governed Surface Standard

System Admin list/table pages use governed server-window surfaces.

Rules:

- server code owns query, filtering, sorting, pagination, and redaction;
- client components receive render-ready configuration, not raw Drizzle rows;
- trailing actions use governed `ActionDescriptor` metadata and server actions;
- empty, denied, invalid, and failure states must be represented;
- export or bulk operations run through server jobs, not browser loops.

## Validation Gates

Use the narrowest gate for the change:

```bash
pnpm architecture:check
pnpm --filter @afenda/feature-system-admin typecheck
pnpm --filter @afenda/feature-system-admin test
pnpm lint:governed-renderers
pnpm security:review
```

Run `pnpm typecheck` when public package exports, app adapters, or shared types
change. Run route/e2e coverage when `/system-admin/*` behavior changes.
