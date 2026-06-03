# ARCH-1006 · Control Plane

**Doc ID:** `ARCH-1006` · **File:** `1006-control-plane.md`

| Field | Value |
| ----- | ----- |
| Status | **Live** (Jun 2026) |
| Layer | Control plane — System Admin (`/system-admin/*`) |
| Defers to | **ARCH-1001** · **ARCH-1002** (kernel enforces) · **ARCH-1003** (UI) · **ARCH-1005** (infra) |
| Package | `@afenda/feature-system-admin` |

Former **ARCH-011** and all `011-system-admin-*` supplements.

---

## 1. What the control plane is

**System Admin** is the ERP function that **configures, reviews, and evidences** organization-level controls — users, access, modules, policies, audit, integrations, data jobs, diagnostics, billing posture, Lynx governance.

It is **not** where runtime business rules execute. It is **not** the execution kernel.

```txt
System Admin     configures and reviews the law
Execution kernel enforces the law at mutation time (@afenda/kernel)
Feature modules  execute business behavior (@afenda/feature-*)
apps/erp         thin routes → feature-system-admin
```

Route: `/system-admin/*` via `(workspace)/[moduleId]` where `moduleId = system-admin` (**ARCH-1005** §8).

---

## 2. Core rules

| Rule | Detail |
| ---- | ------ |
| Org context | `organizationId` from server session only — never client-supplied |
| Authorization | Re-check capabilities in RSC, Server Actions, and Route Handlers |
| Lists | Governed server windows — no full tenant datasets to the browser (**ARCH-1003**) |
| Mutations | Commands/domain via kernel envelope — same backend law as ERP modules (**ARCH-1002**) |
| Audit | Sensitive admin changes write audit evidence; target: consume domain events (**ARCH-1002** §4) |
| Kernel boundary | `@afenda/kernel` must **not** import `@afenda/feature-system-admin` |
| App routes | Thin adapters only — logic in `@afenda/feature-system-admin` |

---

## 3. What System Admin includes

| Domain | Job |
| ------ | --- |
| **Overview** | Admin hub, posture summary, navigation, exception entry |
| **Users** | Invite, suspend, remove, access inspection |
| **Memberships** | Org participation, status, role coverage |
| **Roles** | Catalog, assign/remove, deprecation, diff evidence |
| **Permissions** | Catalog, risk levels, overrides, SoD inputs |
| **Capabilities** | Kernel-sourced catalog, org availability, coverage/readiness |
| **Modules** | Enablement, rollout, dependency readiness |
| **Policies** | Org rules, thresholds, locks — loaded by kernel at runtime |
| **Approvals** | Chains, escalation, delegation config |
| **Audit viewer** | Search, filter, export, retention, coverage gaps |
| **Security** | MFA posture, trusted domains, session policy, break-glass |
| **Organization** | Locale, timezone, fiscal calendar, numbering, region |
| **Integrations** | API credentials, webhooks, SSO, delivery health |
| **Data management** | Import/export jobs, staging, validation, row evidence *(target vertical)* |
| **Diagnostics** | Governance drift, coverage gaps, config exceptions |
| **Reliability** | Cron, webhooks, workflow, migration health signals |
| **Billing** | Subscription, entitlements, license impact by role/module |
| **Lynx** | Usage, approval sandboxes, machine-layer governance (**ARCH-1005** §11) |

---

## 4. What System Admin does not own

| Excluded | Owner |
| -------- | ----- |
| Runtime permission verdicts on protected actions | `@afenda/kernel` |
| Neon Auth provider implementation | `@afenda/neon-auth` |
| HR/Finance/… business rules | `@afenda/feature-*` |
| Schema DDL and migrations | `@afenda/db` (**ARCH-1005** §9) |
| Workflow engine internals | `@afenda/workflows` |
| Shell chrome | `@afenda/appshell` |
| Lynx retrieval product behavior | `@afenda/feature-lynx`, `@afenda/feature-knowledge` |
| Direct AI table writes | Domain commands + governed tools |

---

## 5. Configure vs enforce

| Concern | System Admin (configure / review) | Kernel (enforce at runtime) |
| ------- | ----------------------------------- | ----------------------------- |
| Users & memberships | Invites, lifecycle, access review UI | Actor + membership context |
| Roles & permissions | Catalog, assignments, overrides | Capability verdicts |
| Capabilities & modules | Visibility, readiness, rollout | Access checks against catalog |
| Policies & approvals | Org configuration | Policy evaluator + workflow gate |
| Audit viewer | Search, export, retention UI | Audit write contract |
| Integrations | Credentials, webhooks, delivery review | Auth on integration-originated commands |
| Data jobs | Operator surface, job evidence | Permission on import/export actions |

If execution needs a stable rule, promote the **contract** to kernel, auth, db, or workflows — not a feature import into kernel.

---

## 6. Package layout

```txt
packages/features/system-admin/src/
  index.ts | client.ts | server.ts | metadata.ts
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
  data-management/      # target enterprise vertical
  diagnostics/
  reliability/
  billing/
  lynx/
  tenant-execution/     # bridge (nav settings cache, etc.) — not a route
```

**Vertical slices** — each domain owns its own `actions/`, `data/`, `schemas/`, `surface/`, … when needed.

**Do not restore** flat root buckets (`src/actions/`, `src/components/` at package root).

`tenant-execution/` holds cross-cutting bridge code (e.g. workspace navigation settings) — not a user-facing route.

---

## 7. Routes (required)

| Surface | Path |
| ------- | ---- |
| Hub | `/system-admin` |
| Users | `/system-admin/users` |
| Memberships | `/system-admin/memberships` |
| Roles | `/system-admin/roles` |
| Permissions | `/system-admin/permissions` |
| Modules | `/system-admin/modules` |
| Capabilities | `/system-admin/capabilities` |
| Policies | `/system-admin/policies` |
| Approvals | `/system-admin/approvals` |
| Audit | `/system-admin/audit` |
| Security | `/system-admin/security` |
| Organization | `/system-admin/organization` |
| Integrations | `/system-admin/integrations` |
| Lynx | `/system-admin/lynx` |
| Diagnostics | `/system-admin/diagnostics` |
| Reliability | `/system-admin/reliability` |
| Billing | `/system-admin/billing` |
| Data management | `/system-admin/data-management` |

App files: thin `page.tsx` → `workspace-routes` or `@afenda/feature-system-admin/server`.

---

## 8. Registry surfaces

System Admin is the operator UI for catalogs defined in backend/registry (**ARCH-1002**, **ARCH-1004**):

| Registry | Shows |
| -------- | ----- |
| Command catalog | Registered commands, missing audit, permission drift |
| API registry | Public/internal endpoints, deprecated routes, coverage |
| Event catalog | Event types, consumers, gaps |
| Capability catalog | Kernel-sourced capabilities + org availability |

Physical aggregation: `packages/registry` *(target)*. Features declare; registry aggregates; System Admin reviews.

---

## 9. Permissions

Domain-scoped, explicit keys:

```txt
system-admin.users.read · system-admin.users.manage
system-admin.roles.read · system-admin.roles.manage
system-admin.permissions.read · system-admin.permissions.manage
system-admin.capabilities.read · system-admin.capabilities.manage
system-admin.modules.read · system-admin.modules.manage
system-admin.audit.read · system-admin.audit.export
system-admin.integrations.manage
system-admin.data-management.run    # target — import/export jobs
```

Phase 1: prefer `.read` / `.manage` pairs per domain. High-risk changes require confirmation + audit.

Capabilities displayed in admin are sourced from `@afenda/kernel` execution capability catalog — System Admin does not invent runtime capability definitions.

---

## 10. Guarded admin mutations

Same envelope as other protected ERP mutations (**ARCH-1002** §7):

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

Prefer `runGuardedExecution` when it reduces duplication.

Target: admin audit viewer reads **event store**, not parallel ad hoc log tables.

---

## 11. Data management (import/export)

Enterprise workbench — not a generic upload form.

| Owns | Does not own |
| ---- | ------------ |
| Job config, templates, staged validation | Schema migrations (`@afenda/db`) |
| Row-level failure evidence | Feature domain posting rules |
| Retry/cancel, job history | Unrestricted client-side CSV parsing of tenant data |
| Import permissions & audit | Direct table writes bypassing commands |

Long-running jobs may delegate to `@afenda/workflows`; System Admin keeps operator UI and evidence.

Minimum vertical shape:

```txt
data-management/
  actions/ data/ schemas/ contracts/ surface/ policies/ events/ tests/
```

Do not store raw CSV bodies, secrets, or full PII rows in evidence tables.

---

## 12. Lynx governance

System Admin `/system-admin/lynx`: usage, approval sandboxes, monitor controls.

Product behavior stays in `@afenda/feature-lynx` / `@afenda/feature-knowledge`. Admin configures and reviews — does not implement retrieval.

Banned user-facing terms: "AI assistant", "copilot", "chatbot" — use **Lynx** (**ARCH-1005** §11).

---

## 13. Development pipeline (new vertical)

1. Update this doc if domain boundaries change.
2. Add package-local `src/<vertical>/<vertical>-architecture.md` for deep detail only when needed.
3. Contracts + Zod schemas + permission keys.
4. Policy guards via execution context.
5. DB commands in `@afenda/db` when persistence required — schema via `db:generate` (**ARCH-1005**).
6. Server windows + governed Pattern C surfaces (**ARCH-1003** §6).
7. Thin app adapter + tests.

Start with authority and evidence — not UI mockups.

---

## 14. Enterprise gaps (explicit targets)

| Gap | Target |
| --- | ------ |
| Access governance | SoD rules, toxic combinations, certification campaigns, dormant access |
| Data management | Full import/export workbench vertical |
| Config change governance | Before/after diffs, scheduled activation, rollback evidence |
| Exception center | Single queue: failed webhooks, imports, stale invites, audit gaps |
| Integration ops | Ping, rotate keys, resend, dead-letter review |
| Break-glass | JIT support access, time-bound, mandatory audit |
| Registry UI | Command/API/event health when `packages/registry` lands |

---

## 15. Vertical domains

Detail for each System Admin area lives in §3–§11 above. Package-local supplements under `packages/features/system-admin/src/**/` remain as implementation notes — link to **ARCH-1006**.

Enterprise benchmark (non-doctrine): [`docs/testing/system-admin-competitive-scorecard.md`](../testing/system-admin-competitive-scorecard.md).

---

## 16. Verification

```bash
pnpm --filter @afenda/feature-system-admin typecheck
pnpm --filter @afenda/feature-system-admin test
pnpm architecture:check
pnpm security:review    # when changing admin auth or import paths
```

---

## 17. Summary

```txt
Control plane = @afenda/feature-system-admin at /system-admin/*

Configures:  users, access, modules, policies, audit, integrations, data jobs, registry review
Enforces:    nothing — kernel + features enforce at runtime
Rules:       server org · capability checks · governed lists · audit evidence

ARCH-1001–1006 complete the 6-doc library.
```
