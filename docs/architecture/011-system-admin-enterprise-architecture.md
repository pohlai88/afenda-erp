# ARCH-011 · System Admin Architecture

**Doc ID:** `ARCH-011` · **File:** `011-system-admin-enterprise-architecture.md`

| Field     | Value |
| --------- | ----- |
| Status    | Active — system-admin control-module doctrine with as-built compatibility |
| Authority | System-admin module boundary, control domains, package structure, and administrative governance rules |
| Defers to | **ARCH-002** for package boundaries · **ARCH-001** for runtime/auth/deployment · **ARCH-005** for schema ownership · **ARCH-012** for execution enforcement |
| Related   | **ARCH-006**/**ARCH-007** (governed UI) · **ARCH-008** (workspace discipline) · **ARCH-009** (Lynx governance) |

System Admin is Afenda's administrative control module. It manages the
configuration that determines how organizations, users, memberships, roles,
permissions, modules, policies, approvals, security posture, integrations, and
audit visibility are controlled.

System Admin does not enforce execution law directly. It configures the law
that the Execution Kernel enforces.

This document is doctrine for engineers building `/system-admin/*`,
`@afenda/feature-system-admin`, related auth and database services, and
governed administrative surfaces. It is not a roadmap, a UI brief, or a
substitute for the execution-kernel contract in **ARCH-012**.

## Core Principle

> System Admin configures the law.  
> Execution Kernel enforces the law.  
> Feature modules execute business behavior.  
> AppShell and Nexus expose the operating surface.

System Admin is therefore a feature module with elevated administrative
purpose. It is not shared execution infrastructure, not a hidden dependency for
every module, and not a replacement for `@afenda/auth`, `@afenda/db`, or
`@afenda/kernel/server`.

## Relationship to Execution Kernel

System Admin and the Execution Kernel are intentionally separate but tightly
co-linked.

| Area | System Admin | Execution Kernel |
| ---- | ------------ | ---------------- |
| Users | Creates, invites, suspends, and manages membership | Resolves current actor and membership context |
| Roles | Creates, edits, assigns, and deprecates roles | Resolves effective permissions |
| Permissions | Displays and assigns permission sets | Checks required permissions during execution |
| Modules | Enables, disables, and configures module access | Provides capability contract and enforces access |
| Policies | Configures policy rules and thresholds | Evaluates runtime policy verdicts |
| Audit | Views, filters, and exports audit evidence | Defines and writes audit events |
| Admin UI | Owns screens, forms, tables, editors, and diagnostics | Owns no admin UI |

`ARCH-011` and `ARCH-012` must move together when this boundary changes.

## What System Admin Owns

System Admin owns:

- user management;
- team and membership management;
- role management;
- permission assignment and review;
- module enablement and visibility;
- capability visibility and readiness review;
- policy configuration;
- approval configuration;
- audit viewer and evidence review;
- security settings;
- organization settings;
- integration settings;
- admin diagnostics.

## What System Admin Does Not Own

System Admin does not own:

- execution context resolution;
- permission checking runtime;
- policy enforcement runtime;
- audit event writing contract;
- feature-module business logic;
- AppShell navigation engine;
- Nexus attention routing;
- low-level auth/session implementation.

Those belong to the Execution Kernel, platform packages, AppShell, Nexus, or
feature modules.

## Package Boundary

System Admin follows **ARCH-002**. The deployable app owns route composition;
`@afenda/feature-system-admin` owns the module behavior.

Recommended internal package shape:

```txt
packages/features/system-admin/src/
  users/
  teams/
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
  diagnostics/
  components/
  data/
  actions/
  schemas/
  index.ts
  client.ts
  server.ts
  metadata.ts
```

Execution Kernel remains separate:

```txt
packages/kernel/src/execution-kernel/
  context/
  actor/
  access/
  policy/
  audit/
  capabilities/
  execution/
  errors/
  state/
```

Current as-built route and package surfaces already exist under:

- `apps/erp/src/app/(app)/system-admin/*`
- `packages/features/system-admin`

The current route family is `/system-admin/*`. Locale and organization-slug
route prefixes are a future routing concern and do not override today's
App Router doctrine in **ARCH-001**.

## Dependency Direction

System Admin may depend on the Execution Kernel.

```ts
import {
  requireExecutionContext,
  requireExecutionPermission,
  listExecutionCapabilities,
} from "@afenda/kernel/server";
```

The Execution Kernel must not depend on System Admin feature code.

```ts
import { getAdminRoleConfig } from "@afenda/feature-system-admin/server";
```

Correct direction:

```txt
System Admin ─────▶ Execution Kernel
Feature Modules ──▶ Execution Kernel
AppShell/Nexus ───▶ Execution Kernel metadata

Execution Kernel ─X─▶ System Admin
```

The kernel may read shared auth and database contracts that System Admin also
uses. It must not import `@afenda/feature-system-admin`.

## System Admin Access Rule

System Admin is itself protected by the Execution Kernel. Administrative
surfaces and mutations are not inherently trusted.

Example:

```ts
await requireExecutionPermission(context, "system-admin.roles.manage");
```

This prevents System Admin from becoming an unguarded super-module.

## Core Control Domains

System Admin is organized by administrative control domain. Each domain must
have a clear authority source, validation boundary, audit behavior, and
governed surface.

| Domain | Owns | Notes |
| ------ | ---- | ----- |
| Users | invite, deactivate, resend invitation, inspect user access, remove user | User lifecycle is admin-owned; auth provider remains platform-owned. |
| Memberships | membership scope, team assignment, status linkage, membership review | Membership is both a control-plane concern and an execution-kernel context input. |
| Roles | role creation, editing, assignment, deprecation, bundle review | Role changes must remain traceable and capability-backed. |
| Permissions | permission catalog display, assignment, grouping, coverage review | Permissions come from declared contracts; no ad hoc keys. |
| Modules | module enablement, visibility, readiness, access configuration | Module settings shape availability, not business execution logic. |
| Capabilities | capability visibility, availability by role, readiness review, metadata inspection | Capability definitions come from **ARCH-012**. |
| Policies | policy settings, thresholds, lock rules, exception rules | Runtime evaluation belongs to the kernel. |
| Approvals | approval chain configuration, escalation timing, delegation | Approval execution may live in workflows or feature modules. |
| Audit viewer | audit search, filtering, export, event detail, evidence timeline | Audit writing belongs to the kernel. |
| Security | session policy settings, MFA posture, trusted domains, sensitive-action confirmation | Auth implementation remains `@afenda/auth`. |
| Organization | organization profile, locale, timezone, calendar defaults, numbering defaults, data region, ZDR | Organization defaults are shared runtime inputs. |
| Integrations | integration enablement, credential posture, webhooks, external connection status | Secret hashing and dispatch runtime remain service concerns. |
| Diagnostics | health checks, config drift indicators, permission warnings, inactive module warnings, audit coverage warnings | Diagnostics are control evidence, not runtime enforcement. |

## Current As-Built Surface

The current repository already exposes these surfaces:

| Surface | Route | Current focus |
| ------- | ----- | ------------- |
| Hub | `/system-admin` | tenant admin summary and navigation |
| Identity | `/system-admin/identity` | members, invitations, role changes, tenant role overrides |
| Organization | `/system-admin/organization` | locale, timezone, currency, fiscal year, numbering, data region, ZDR |
| Audit | `/system-admin/audit` | audit logs, retention policy, export boundary |
| Integrations | `/system-admin/integrations` | API credentials, webhooks, delivery rows, SSO configuration |
| Lynx | `/system-admin/lynx` | Lynx usage, approval sandboxes, monitor actions, spend posture |
| Reliability | `/system-admin/reliability` | cron-route visibility |
| Billing | `/system-admin/billing` | tenant usage and marketplace posture |

These are the current operational doors. The domain model above is the target
control-module structure that future extraction and re-bucketing should follow.

## Data Flow

System Admin changes configuration. Future protected execution uses the updated
configuration through the kernel.

```txt
1. Admin opens System Admin
2. Execution Kernel checks admin permission
3. Admin updates role, module, policy, or security configuration
4. System Admin validates input
5. System Admin writes configuration
6. Execution Kernel audit contract records the change
7. Future feature actions are enforced using the updated configuration
```

## Example Flows

### Role Assignment Flow

```txt
1. Admin assigns an HR role to a member
2. System Admin validates the role and membership
3. Execution Kernel checks `system-admin.roles.manage`
4. System Admin writes the role assignment
5. Audit records `system-admin.role-assignment.create`
6. Later, the member opens HR
7. Execution Kernel resolves effective permissions
8. HR allows or blocks actions based on those permissions
```

### Policy Configuration Flow

```txt
1. Admin configures a payroll-finalized lock policy
2. System Admin validates policy shape
3. Execution Kernel checks `system-admin.policies.manage`
4. System Admin writes policy configuration
5. Audit records `system-admin.policy.update`
6. Later, HR attempts a compensation update
7. Execution Kernel evaluates the policy
8. The action is blocked if the verdict denies it
```

## Public API Boundary

System Admin should expose module-level APIs, not raw persistence helpers.

```ts
export {
  listSystemAdminUsers,
  inviteSystemAdminUser,
  deactivateSystemAdminUser,
} from "./users";

export {
  listSystemAdminRoles,
  createSystemAdminRole,
  assignSystemAdminRole,
} from "./roles";

export {
  listSystemAdminModules,
  updateSystemAdminModuleSettings,
} from "./modules";

export {
  listSystemAdminPolicies,
  updateSystemAdminPolicy,
} from "./policies";

export { searchSystemAdminAuditEvents } from "./audit-viewer";
```

Do not export raw database helpers from the package root.

## Route And UI Doctrine

System Admin should feel like an enterprise control room, not a settings dump.

Recommended surface families:

- admin overview;
- user access table;
- role matrix;
- permission matrix;
- module readiness grid;
- capability coverage table;
- policy rule editor;
- approval chain editor;
- audit evidence timeline;
- security posture panel;
- diagnostics checklist.

UI rules:

- Server-first by default.
- Client components are allowed only for interactive editors, filters,
  dialogs, and matrix controls.
- Governed list surfaces use server-window patterns from **ARCH-006** and
  **ARCH-007**.
- Administrative screens must not imply runtime enforcement that the kernel
  does not actually provide.

## Guarded Admin Action Pattern

Sensitive admin actions should follow the same guarded execution contract as any
other protected server mutation.

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
    metadata: {
      roleId: parsed.roleId,
    },
  });

  return result;
}
```

Where possible, prefer the shared guarded wrapper from **ARCH-012** rather than
hand-assembling this flow repeatedly.

## Permission Naming Doctrine

Administrative permissions must be explicit and domain-scoped.

Recommended examples under Afenda's current naming convention:

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

Audit actions should also be explicit and stable:

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
```

## Governance Rules

1. System Admin is a feature module, not the kernel.
2. System Admin must use the Execution Kernel for its own access checks.
3. System Admin may configure permissions and policies but must not enforce
   them directly for other modules.
4. System Admin must not become a shared dependency for HR, Inventory,
   Finance, CRM, Approvals, or Lynx.
5. System Admin writes configuration; the Execution Kernel reads and enforces
   configuration through shared contracts.
6. System Admin screens must be server-first.
7. Sensitive admin actions must write audit evidence.
8. Role and permission changes must be traceable.
9. Stable contracts beat scattered helpers.
10. `ARCH-011` changes that affect enforcement boundaries require a matching
    review of **ARCH-012**.

## As-Built Vs Target

The table below defines the compatibility line between current implementation
and target doctrine.

| Area | As-built | Target doctrine |
| ---- | -------- | --------------- |
| Module identity | `@afenda/feature-system-admin` exists as the administrative feature package. | System Admin remains a feature module and never becomes shared execution infrastructure. |
| Identity | Members, invitations, role changes, and tenant role overrides already exist. | Users, memberships, and roles are separated into clearer package domains with traceable actions. |
| Permissions and capabilities | Capability catalog exists; role overrides can be stored. | Permission coverage, capability review, and module access controls become first-class admin domains linked to **ARCH-012** capability contracts. |
| Policies and approvals | Partial configuration surfaces exist today. | Policy and approval law become explicit configuration domains consumed by the kernel at runtime. |
| Audit | Audit logs and export boundaries exist. | Audit viewer becomes a full evidence-review surface while the kernel remains the only audit-writing authority. |
| Security and organization | Security posture and organization defaults already exist. | Security controls and organization defaults (locale, numbering, data region, ZDR) stay package-owned and kernel-readable. |
| Diagnostics | Some admin summary signals exist today. | Drift, inactive capabilities, missing audit coverage, and permission warnings become explicit diagnostics surfaces. |

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
| Auth, audit, security, webhook, billing, or Lynx approval changes | `pnpm security:review` |

## Related Documents

| Document | Use |
| -------- | --- |
| [011-system-admin-users-architecture.md](011-system-admin-users-architecture.md) | Users control domain supplement |
| [011-system-admin-memberships-architecture.md](011-system-admin-memberships-architecture.md) | Memberships control domain supplement |
| [011-system-admin-roles-architecture.md](011-system-admin-roles-architecture.md) | Roles control domain supplement |
| [011-system-admin-permissions-architecture.md](011-system-admin-permissions-architecture.md) | Permissions control domain supplement |
| [011-system-admin-modules-architecture.md](011-system-admin-modules-architecture.md) | Modules control domain supplement |
| [011-system-admin-capabilities-architecture.md](011-system-admin-capabilities-architecture.md) | Capabilities control domain supplement |
| [ARCH-001 · System Architecture](001-system-architecture.md) | Runtime, auth, tenancy, routing, deployment, cron, observability |
| [ARCH-002 · ERP Kernel Package Architecture](002-erp-kernel-package-architecture.md) | Feature package boundaries, imports, extraction, single-app model |
| [ARCH-005 · Database Scale Architecture](005-database-scale-architecture.md) | Schema ownership, table promotion, tenant isolation |
| [ARCH-006 · Metadata-Driven UI Architecture](006-metadata-driven-ui-architecture.md) | Server-window lists, metadata authority, runtime contracts |
| [ARCH-007 · Governed Metadata Architecture](007-governed-metadata-architecture.md) | Renderer kernel, builders, governed-surface parity |
| [ARCH-009 · Machine Layer Doctrine](009-machine-layer-doctrine.md) | Lynx vocabulary, machine-layer package split, governed tool envelope |
| [ARCH-012 · Execution Kernel Architecture](012-execution-kernel-architecture.md) | Execution context, access, policy, audit, capabilities, guarded execution |
