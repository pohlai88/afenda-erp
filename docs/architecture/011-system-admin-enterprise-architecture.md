# ARCH-011 - System Admin Enterprise Architecture

**Doc ID:** `ARCH-011`  
**File:** `011-system-admin-enterprise-architecture.md`

| Field | Value |
| ----- | ----- |
| Status | Active - enterprise System Admin control-plane doctrine |
| Authority | System Admin module boundary, enterprise admin domains, package structure, governance rules, development pipeline |
| Defers to | **ARCH-002** for feature package boundaries and execution enforcement, **ARCH-001** for runtime/auth/deployment, **ARCH-005** for schema ownership |
| Related | **ARCH-006**/**ARCH-007** governed UI, **ARCH-008** workspace discipline, **ARCH-009** Lynx governance |

## Definition

**System Admin is the ERP function that configures, reviews, evidences, and
operates organization-level administrative controls, including users,
memberships, roles, permissions, capabilities, modules, policies, approvals,
audit, security posture, organization defaults, integrations, data management,
reliability, billing impact, diagnostics, and Lynx governance.**

System Admin does not enforce execution law directly. It configures and exposes
the law that the Execution Kernel enforces. This document is doctrine for
engineers building `/system-admin/*`, `@afenda/feature-system-admin`, related
auth/database/workflow services, and governed administrative surfaces. It is not
a roadmap, UI brief, or substitute for the execution-kernel contract in
**ARCH-002** section 5.

---

# System Admin Includes

| Area | What It Covers |
| ---- | -------------- |
| **Admin Hub** | Control overview, posture summary, domain navigation, recent changes, and exception entry points |
| **User Governance** | User invitation, activation, suspension, removal, dormant access signals, and user access explanation |
| **Membership Governance** | Organization participation, membership status, role coverage, and access review inputs |
| **Role Governance** | Role catalog, role assignment/removal, role deprecation, role diff, and role impact evidence |
| **Permission Governance** | Permission catalog, high-risk permissions, overrides, toxic-combination inputs, and permission review |
| **Capability Governance** | Capability catalog, runtime readiness, role matrix, and capability coverage evidence |
| **Module Administration** | Module enablement, disabled-module posture, dependency readiness, and rollout controls |
| **Policy Configuration** | Organization policy rules, thresholds, locks, exceptions, versioned changes, and kernel-loaded rule evidence |
| **Approval Administration** | Approval chains, escalation, delegation, enablement, and approval rule evidence |
| **Audit Viewer** | Audit search, filters, detail, retention review, coverage gaps, and exportable evidence packages |
| **Security Administration** | MFA posture, trusted domains, session policy, sensitive action confirmation, and break-glass posture |
| **Organization Configuration** | Locale, timezone, fiscal calendar, numbering, data region, zero-data-retention, and default settings |
| **Integration Operations** | API credentials, SSO, webhooks, endpoint health, delivery history, retries, signing keys, and test payloads |
| **Data Management** | Import/export templates, parsing, staged rows, validation, job history, retries, cancellation, and row evidence |
| **Diagnostics and Reliability** | Governance drift, coverage gaps, cron, queue, workflow, migration, webhook, cache, and storage health |
| **Billing and License Impact** | Subscription posture, invoices, plans, entitlements, usage, and impact by role/module/capability |
| **Lynx Governance** | Lynx usage, approval sandboxes, monitor controls, and machine-layer governance under **ARCH-009** |

---

# System Admin Does Not Include

| Excluded Area | Owned By |
| ------------- | -------- |
| Runtime execution verdicts for protected actions | Execution Kernel in **ARCH-002** section 5 |
| Global authentication provider implementation | `@afenda/auth` and platform identity providers |
| App route composition and shell layout | `apps/erp` route adapters and workspace shell |
| Durable business rules for HR, Finance, Inventory, CRM, or other modules | Owning `@afenda/feature-*` package |
| Physical database schema ownership and migration execution | `@afenda/db` under **ARCH-005** |
| Long-running workflow engine implementation | `@afenda/workflows` or future workflow runtime |
| Governed renderer kernel and shared UI primitives | `@afenda/governed-surface` and `@afenda/ui` |
| External payment processor implementation | Billing provider integration and marketplace services |
| External identity-provider product behavior | Identity provider and SSO integration services |
| Lynx product behavior and Knowledge substrate behavior | `@afenda/feature-lynx` and `@afenda/feature-knowledge` |
| Direct table writes from AI or machine tools | Domain services with governed tool approvals |

---

# System Admin Requirement Statement

| Requirement | Description |
| ----------- | ----------- |
| **System Admin** | Provides the enterprise administrative control plane for configuring and reviewing tenant users, memberships, roles, permissions, capabilities, modules, policies, approvals, audit evidence, security posture, organization settings, integrations, data movement, diagnostics, reliability, billing impact, and Lynx governance while delegating runtime enforcement to the Execution Kernel. |

---

# Enterprise Functional Requirements

| Code | Requirement |
| ---- | ----------- |
| **SYS-ADM-001** | System shall provide a System Admin hub that summarizes administrative posture, recent changes, and attention items. |
| **SYS-ADM-002** | System shall support user invitation, resend, cancellation, activation, suspension, reactivation, removal, and status review. |
| **SYS-ADM-003** | System shall support organization membership review, membership status changes, and membership role coverage. |
| **SYS-ADM-004** | System shall support role catalog review, role creation, role update, role deprecation, and role diff evidence. |
| **SYS-ADM-005** | System shall support role assignment and role removal with actor, target, reason, and audit evidence. |
| **SYS-ADM-006** | System shall maintain a permission catalog with risk levels, override visibility, and high-risk permission confirmation. |
| **SYS-ADM-007** | System shall maintain a capability catalog with role coverage, module coverage, and runtime-readiness signals. |
| **SYS-ADM-008** | System shall support module enablement, disablement, visibility, dependency readiness, and rollout controls. |
| **SYS-ADM-009** | System shall support organization-scoped policy configuration with thresholds, locks, exceptions, and versioned rule changes. |
| **SYS-ADM-010** | System shall support approval chain configuration, escalation settings, delegation posture, and approval enablement. |
| **SYS-ADM-011** | System shall provide audit search, filtering, detail review, retention review, coverage indicators, and evidence export. |
| **SYS-ADM-012** | System shall provide security posture controls for MFA, trusted domains, session policy, and sensitive action confirmation. |
| **SYS-ADM-013** | System shall support organization settings for locale, timezone, fiscal calendar, numbering, data region, and zero-data-retention posture. |
| **SYS-ADM-014** | System shall support API credentials, webhook endpoints, SSO configuration, credential posture, and integration readiness. |
| **SYS-ADM-015** | System shall support integration operations including endpoint ping, signing-key rotation, test payloads, resend, retry policy, and delivery history. |
| **SYS-ADM-016** | System shall support data import/export templates, upload intake, CSV/spreadsheet parsing, staged validation, and job creation. |
| **SYS-ADM-017** | System shall support import job execution, row-level failure evidence, retry, cancellation, job history, and export evidence. |
| **SYS-ADM-018** | System shall provide diagnostics for governance drift, missing audit coverage, disabled modules, stale invites, and configuration gaps. |
| **SYS-ADM-019** | System shall provide reliability visibility for cron, queues, workflows, migrations, webhooks, cache, and storage health. |
| **SYS-ADM-020** | System shall provide billing and entitlement visibility for subscriptions, invoices, plans, usage, and marketplace posture. |
| **SYS-ADM-021** | System shall show license and feature impact by role, module, capability, plan, and enabled feature. |
| **SYS-ADM-022** | System shall provide Lynx governance for usage, approvals, sandbox behavior, monitor controls, and machine-layer posture. |
| **SYS-ADM-023** | System shall support access governance workflows including segregation-of-duties checks, toxic-combination detection, certification campaigns, and dormant-access cleanup. |
| **SYS-ADM-024** | System shall support configuration change governance with before/after diffs, approval hooks, scheduled activation, rollback history, and environment drift evidence. |
| **SYS-ADM-025** | System shall provide an operational exception center that consolidates failed webhooks, failed imports, stale invites, disabled modules, security gaps, and missing audit coverage. |
| **SYS-ADM-026** | System shall support just-in-time support access, break-glass administration, impersonation/session review, emergency access expiry, and mandatory audit evidence. |
| **SYS-ADM-027** | System shall derive organization context from server session or execution context and shall not trust client-supplied organization identifiers. |
| **SYS-ADM-028** | System shall re-check capabilities in Server Components, Server Actions, and Route Handlers before protected reads or mutations. |
| **SYS-ADM-029** | System shall render tenant lists through governed server-window surfaces and shall not ship full tenant datasets to the browser for pagination. |
| **SYS-ADM-030** | System shall write audit evidence for sensitive admin changes, including role, permission, module, policy, integration, import, security, support-access, and organization-setting changes. |

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
| 16 | Lynx governance follows **ARCH-009** vocabulary, approvals, tool metadata, and machine-layer boundaries. |
| 17 | All protected System Admin reads and mutations derive `organizationId` from server context. |
| 18 | All protected System Admin actions re-check capabilities server-side before reading or mutating tenant data. |
| 19 | Governed list pages use server-window pagination, filtering, sorting, and redaction. |
| 20 | `apps/erp` routes remain thin adapters that call `@afenda/feature-system-admin` export doors. |

## Core Principle

```txt
System Admin configures the law.
Execution Kernel enforces the law.
Feature modules execute business behavior.
App shell exposes the operating surface.
```

System Admin is therefore a feature package with elevated administrative
purpose. It is not shared execution infrastructure, not a hidden dependency for
every feature module, and not a replacement for `@afenda/auth`, `@afenda/db`,
`@afenda/workflows`, or `@afenda/kernel/server`.

## Enterprise ERP Baseline

Afenda System Admin should be evaluated against enterprise ERP administration
patterns, not against generic settings pages.

| Vendor pattern | Reference capability | Afenda implication |
| -------------- | -------------------- | ------------------ |
| SAP S/4HANA Cloud | Formal IAM around business users, business roles, authorizations, and IAM reporting. See [SAP IAM](https://help.sap.com/docs/SAP_S4HANA_CLOUD/53e36b5493804bcdb3f6f14de8b487dd/12032b657e104bb7ac4da02b2d3b3313.html). | Users, roles, capabilities, and access reports must be first-class evidence surfaces. |
| Oracle ERP Cloud | Security Console, role review, data access control, and audit reports. See [Oracle ERP security](https://docs.oracle.com/en/cloud/saas/applications-common/25d/faser/securing-oracle-erp-cloud-overview.html) and [Oracle audit reports](https://docs.oracle.com/en/cloud/saas/applications-common/24b/oacpr/audit-reports.html). | Role/data access review and audit evidence must be traceable, filterable, and exportable. |
| Microsoft Dynamics 365 | Role-based security, segregation-of-duties framing, and Data Management import/export. See [Dynamics role security](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/sysadmin/role-based-security) and [Dynamics data management](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/data-entities/data-management-integration-data-entity). | SoD risk, role impact, and governed import/export jobs are enterprise baseline, not optional polish. |
| NetSuite | CSV Import Assistant gated by import permission. See [NetSuite CSV import](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N343158.html). | CSV/data imports need dedicated permissions, staging, validation, job history, and row evidence. |

## Enterprise Gaps

These are the enterprise-grade improvement domains that local System Admin must
make explicit in architecture and implementation.

| Gap | Local state | Target |
| --- | ----------- | ------ |
| Access governance | Roles, permissions, capabilities, policies, and role overrides exist. | SoD conflict rules, toxic-combination detection, role diff, "why does this user have access?", certification campaigns, and dormant-access cleanup. |
| Data management / import workbench | No local import-job vertical exists. | Import/export jobs with templates, staged validation, row-level failures, retries, job history, dedicated permissions, and audit evidence. |
| Configuration change governance | Settings can be updated and audited. | Before/after config diffs, approvals, scheduled activation, rollback history, environment drift, and clear "who changed what from what to what" evidence. |
| Operational exception center | Diagnostics, reliability, and recent changes exist as separate surfaces. | One admin queue for failed webhooks, stale invites, failed imports, disabled modules, security posture gaps, and missing audit coverage. |
| Integration operations | API credentials, webhooks, SSO, and delivery rows exist. | Endpoint ping, resend delivery, dead-letter review, signing-key rotation, inbound signature verification, retry policy controls, test payloads, and delivery SLA indicators. |
| Support / break-glass governance | Security posture exists; support access is not first-class. | Just-in-time support access, break-glass admin, impersonation/session review, emergency access expiry, and mandatory audit evidence. |
| License / feature / module impact | Billing and module surfaces exist. | License and commercial impact by role, module, capability, plan, and enabled feature. |

## Relationship To Execution Kernel

System Admin and the Execution Kernel are intentionally separate but tightly
linked.

| Concern | System Admin owns | Execution Kernel owns |
| ------- | ----------------- | --------------------- |
| Users and memberships | Invitations, suspension/removal, review, lifecycle evidence | Current actor and membership context at execution time |
| Roles and permissions | Role catalog, assignments, overrides, review, SoD posture | Effective capability verdicts |
| Capabilities and modules | Visibility, readiness, availability, rollout controls | Declared capability contract and runtime access checks |
| Policies and approvals | Organization-scoped policy/approval configuration | Runtime policy verdict and guarded execution envelope |
| Audit viewer | Search, filters, export, retention review, evidence detail | Audit event contract and writes |
| Data management | Import/export configuration, staging, validation evidence, operator controls | Permission and policy enforcement for protected import/export actions |
| Integrations | Credential posture, webhooks, SSO, delivery review | Access enforcement for integration-originated protected actions |

The Execution Kernel must not import System Admin feature code. If a rule is
needed at execution time, promote the stable contract to `@afenda/kernel`,
`@afenda/auth`, `@afenda/db`, or `@afenda/workflows` as appropriate.

## Package Boundary

System Admin follows **ARCH-002** and **ARCH-008**. The deployable app owns
route composition; `@afenda/feature-system-admin` owns module behavior.

Current source shape is vertical, not bucketed:

```txt
packages/features/system-admin/src/
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
  data-management/        # target enterprise vertical
  diagnostics/
  reliability/
  billing/
  lynx/
  tenant-execution/       # cross-cutting bridge, not a route
```

Do not restore root implementation buckets such as:

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
```

Each vertical owns its own `actions/`, `components/`, `contracts/`, `data/`,
`events/`, `policies/`, `schemas/`, `surface/`, and `tests/` folders when the
vertical needs them. `tenant-execution/` is the exception: it is a bridge with
`contracts/`, `data/`, and `policies/`, not a UI surface.

## Enterprise Control Domains

| Domain | Owns | Enterprise minimum |
| ------ | ---- | ------------------ |
| Overview | Admin hub, control links, summary stats, navigation copy | Clear route into each control domain and exception queue |
| Users | User lifecycle, invitation, suspension/removal, access inspection | Invite safety, dormant access signals, user access explanation |
| Memberships | Organization participation, member status, role coverage | Membership review, team/employment extension points |
| Roles | Role catalog, assignment/removal, deprecation | Role diff, role impact, assignment evidence |
| Permissions | Permission catalog, risk levels, overrides | Direct permission review, high-risk confirmation, SoD inputs |
| Capabilities | Capability visibility, readiness, role matrix | Capability coverage and runtime-readiness evidence |
| Modules | Module enablement, visibility, readiness | Rollout controls, disabled-module dependency warnings |
| Policies | Policy rules, locks, thresholds, exceptions | Versioned changes and kernel-loaded rule evidence |
| Approvals | Approval chains, escalation, enablement | Delegation, approval rule evidence, runtime workflow linkage |
| Audit viewer | Search, detail, export, retention, coverage gaps | Evidence timeline and exportable audit packages |
| Security | MFA posture, trusted domains, session policy, sensitive action confirmation | Break-glass and support-access governance |
| Organization | Locale, timezone, fiscal year, numbering, data region, ZDR | Config diffs and rollback-ready evidence |
| Integrations | API credentials, webhooks, SSO, delivery status | Ping, rotate, resend, retry policy, test payloads, SLA indicators |
| Data management | Import/export jobs, templates, validation, staged rows, row outcomes | Dedicated import permissions, job evidence, retries, cancellation |
| Diagnostics | Governance health, drift, coverage gaps | Enterprise exception categories and exportable diagnostics |
| Reliability | Cron, queue, workflow, migration, webhook, cache/storage health | Operational exception center inputs and continuity checks |
| Billing | Subscription, invoices, payments, plans, entitlements | License impact by role/module/capability |
| Lynx | Lynx usage, approvals, sandbox and monitor controls | Machine-layer governance per **ARCH-009** |

## Data Management Doctrine

Data Management is the enterprise workbench for governed data movement. It is
not a generic parser utility and not a browser-only upload form.

Canonical supplement: [ARCH-011 Data Management](011-system-admin-data-management-architecture.md).

Minimum vertical shape:

```txt
data-management/
  actions/
  components/
  contracts/
  data/
  events/
  policies/
  schemas/
  surface/
  tests/
  data-management-architecture.md
```

CSV parsing and import adapter contracts belong inside this vertical:

```txt
data-management/data/system-admin.data-management-csv.parse.shared.ts
data-management/contracts/system-admin.import-adapter.contract.ts
data-management/schemas/system-admin.import-job.schema.ts
```

Long-running execution may be delegated to `@afenda/workflows`, but System
Admin remains the owner of the operator surface, job evidence, validation
reports, action permissions, and audit review.

## Current As-Built Surface

The current route family is `/system-admin/*`. Locale and organization-slug
route prefixes are future routing concerns and do not override **ARCH-001**.

| Surface | Route | Current focus |
| ------- | ----- | ------------- |
| Hub | `/system-admin` | Tenant admin summary and navigation |
| Identity | `/system-admin/identity` | Identity hub composition |
| Users | `/system-admin/users` | User lifecycle and access inspection |
| Memberships | `/system-admin/memberships` | Membership status and role coverage |
| Roles | `/system-admin/roles` | Role catalog and assignments |
| Permissions | `/system-admin/permissions` | Permission catalog and role overrides |
| Modules | `/system-admin/modules` | Module settings and readiness |
| Capabilities | `/system-admin/capabilities` | Capability catalog and role matrix |
| Policies | `/system-admin/policies` | Policy rules and execution settings |
| Approvals | `/system-admin/approvals` | Approval rules and escalation settings |
| Audit | `/system-admin/audit` | Audit logs, retention, coverage, export |
| Security | `/system-admin/security` | Security posture and tenant controls |
| Organization | `/system-admin/organization` | Locale, timezone, fiscal, numbering, region, ZDR |
| Integrations | `/system-admin/integrations` | API credentials, webhooks, delivery rows, SSO |
| Lynx | `/system-admin/lynx` | Lynx usage, approval sandboxes, monitor actions |
| Diagnostics | `/system-admin/diagnostics` | Governance health and drift evidence |
| Reliability | `/system-admin/reliability` | Cron, repo, migration, workflow visibility |
| Billing | `/system-admin/billing` | Usage, marketplace, billing posture |

Data Management is the next enterprise target surface. When implemented, prefer
`/system-admin/data-management` unless route naming is revised in ARCH-004.

## Development Pipeline

Every enterprise System Admin vertical follows this pipeline:

1. Canonical doctrine: update ARCH-011 or an ARCH-011 supplement.
2. Package-local architecture: create or update `src/<vertical>/<vertical>-architecture.md`.
3. Contracts and schemas: define action inputs, list rows, permission keys, audit actions, and route paths.
4. Policy gate: add server-side read/manage/run/export guards using execution context.
5. Data ownership: add `@afenda/db` commands/queries and migrations only when persistence is required.
6. Server model: build page models and bounded server windows; never ship full tenant datasets to clients.
7. Actions: validate input, check permissions, execute domain operation, write audit evidence, dispatch optional webhook, revalidate.
8. Surfaces: build governed Pattern C lists, detail panels, and focused client editors.
9. App adapter: keep `apps/erp` route files thin and call `@afenda/feature-system-admin/server` or `/metadata`.
10. Tests and docs: add unit/gallery tests and update package-local architecture plus file audit.

Do not start by adding UI. Enterprise admin behavior starts with authority,
evidence, and failure semantics.

## Guarded Admin Action Pattern

Sensitive admin actions follow the same protection envelope as other protected
ERP mutations.

```ts
export async function assignSystemAdminRole(input: AssignRoleInput) {
  const context = await requireExecutionContext();

  await requireExecutionPermission(context, "system-admin.roles.manage");

  const parsed = assignRoleInputSchema.parse(input);

  const result = await assignRoleInDb({
    organizationId: context.organizationId,
    actorId: context.userId,
    input: parsed,
  });

  await writeExecutionAuditEvent({
    organizationId: context.organizationId,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system-admin.role-assignment.create",
    targetType: "membership",
    targetId: parsed.membershipId,
    metadata: { roleId: parsed.roleId },
  });

  return result;
}
```

Where possible, prefer shared guarded execution helpers from **ARCH-002** section
5 rather than repeating the protection envelope.

## Permission Naming Doctrine

Administrative permissions must be explicit and domain-scoped.

```txt
system-admin.users.read
system-admin.users.manage
system-admin.roles.read
system-admin.roles.manage
system-admin.permissions.read
system-admin.permissions.manage
system-admin.modules.read
system-admin.modules.manage
system-admin.policies.read
system-admin.policies.manage
system-admin.audit.read
system-admin.security.manage
system-admin.organization.manage
system-admin.integrations.manage
system-admin.data-management.read
system-admin.data-management.manage
system-admin.data-management.run
system-admin.data-management.cancel
system-admin.data-management.export
system-admin.diagnostics.read
```

Avoid vague permission keys:

```txt
admin
super-admin
manage-all
settings-edit
```

## Audit Action Naming

Audit actions are explicit, stable, and evidence-oriented.

```txt
system-admin.user.invite
system-admin.user.deactivate
system-admin.membership.update
system-admin.role.create
system-admin.role.update
system-admin.role.deprecate
system-admin.role-assignment.create
system-admin.role-assignment.remove
system-admin.permission-bundle.update
system-admin.module.enable
system-admin.module.disable
system-admin.policy.create
system-admin.policy.update
system-admin.policy.deprecate
system-admin.security.update
system-admin.organization.update
system-admin.integration.update
system-admin.integration.webhook.ping
system-admin.integration.webhook.rotate_secret
system-admin.integration.webhook.resend
system-admin.data-management.import.create
system-admin.data-management.import.run
system-admin.data-management.import.cancel
system-admin.data-management.import.complete
system-admin.data-management.import.fail
system-admin.data-management.import.row.reject
system-admin.data-management.export
```

Audit metadata must not include secrets, raw credentials, full CSV payloads, or
tenant-sensitive row values beyond explicit redacted evidence fields.

## Governance Rules

1. System Admin is a feature module, not the kernel.
2. System Admin must use the Execution Kernel for its own access checks.
3. System Admin configures permissions and policies but must not enforce them
   for other modules outside the kernel contract.
4. System Admin must not become a shared dependency for HR, Inventory, Finance,
   CRM, Approvals, or Lynx.
5. System Admin writes configuration; the Execution Kernel reads and enforces
   configuration through shared contracts.
6. System Admin screens are server-first by default.
7. Sensitive admin actions write audit evidence.
8. Role, permission, integration, import, security, and support-access changes
   must be traceable.
9. Stable contracts beat scattered helpers.
10. Data parsing and import helpers live in `data-management/`, not generic
    utility folders.
11. `ARCH-011` changes that affect enforcement boundaries require a matching
    review of **ARCH-002** sections 4 and 5.

## Verification Gates

Run the narrowest gate that covers the change.

| Change area | Required gate |
| ----------- | ------------- |
| Architecture docs only | `pnpm architecture:check` |
| Feature package types | `pnpm --filter @afenda/feature-system-admin typecheck` |
| App routes, exports, or shared type changes | `pnpm typecheck` |
| Governed metadata or renderer changes | `pnpm lint:governed-renderers` |
| Command/query changes | `pnpm test` with focused package tests where available |
| `/system-admin/*` route flows | Route tests or `pnpm test:e2e` when behavior changes |
| Auth, audit, security, webhook, billing, Lynx approval, data import/export | `pnpm security:review` |

## Related Documents

| Document | Use |
| -------- | --- |
| [011-system-admin-users-architecture.md](011-system-admin-users-architecture.md) | Users control domain supplement |
| [011-system-admin-memberships-architecture.md](011-system-admin-memberships-architecture.md) | Memberships control domain supplement |
| [011-system-admin-roles-architecture.md](011-system-admin-roles-architecture.md) | Roles control domain supplement |
| [011-system-admin-permissions-architecture.md](011-system-admin-permissions-architecture.md) | Permissions control domain supplement |
| [011-system-admin-modules-architecture.md](011-system-admin-modules-architecture.md) | Modules control domain supplement |
| [011-system-admin-capabilities-architecture.md](011-system-admin-capabilities-architecture.md) | Capabilities control domain supplement |
| [011-system-admin-data-management-architecture.md](011-system-admin-data-management-architecture.md) | Data management and import/export workbench supplement |
| [011-system-admin-competitive-scorecard.md](011-system-admin-competitive-scorecard.md) | Enterprise benchmark and gap scorecard |
| [ARCH-001 - System Architecture](001-system-architecture.md) | Runtime, auth, tenancy, routing, deployment, cron, observability |
| [ARCH-002 - ERP Kernel Package Architecture](002-erp-kernel-package-architecture.md) | Feature package boundaries, imports, extraction, execution kernel |
| [ARCH-005 - Database Scale Architecture](005-database-scale-architecture.md) | Schema ownership, table promotion, tenant isolation |
| [ARCH-006 - Metadata-Driven UI Architecture](006-metadata-driven-ui-architecture.md) | Server-window lists, metadata authority, runtime contracts |
| [ARCH-007 - Governed Metadata Architecture](007-governed-metadata-architecture.md) | Renderer kernel, builders, governed-surface parity |
| [ARCH-009 - Machine Layer Doctrine](009-machine-layer-doctrine.md) | Lynx vocabulary, machine-layer package split, governed tool envelope |
