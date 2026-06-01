**Parent:** [`docs/architecture/011-system-admin-enterprise-architecture.md`](../../../../docs/architecture/011-system-admin-enterprise-architecture.md)

**Canonical supplement:** [`docs/architecture/011-system-admin-modules-architecture.md`](../../../../docs/architecture/011-system-admin-modules-architecture.md)

### 9.5 Modules

## Definition

Modules represent governed ERP business domains.

A module groups related capabilities, permissions, policies, approvals, routes, navigation surfaces, and operational readiness into one administrative unit.

Modules allow administrators to understand:

```txt
What business domains exist?
Which modules are enabled?
Which modules are visible?
Which modules are operationally ready?
Which modules require attention before rollout?
```

A module is not just a navigation toggle.

A module is the administrative control surface for an ERP domain.

## Owns

Modules owns:

* module enablement
* module visibility
* module readiness status
* module access configuration
* module lifecycle status
* module metadata review
* module capability inventory
* module dependency visibility
* module rollout control
* module governance review

## Does Not Own

Modules does not own:

* capability definition
* permission enforcement
* role assignment
* user management
* membership lifecycle
* policy evaluation
* audit event writing
* feature module business logic

Those belong to:

```txt
Execution Kernel
Capabilities
Permissions
Roles
Users
Memberships
Policies
Audit
Feature Modules
```

## Example Permission

```txt
system_admin.modules.manage
```

Recommended split:

```txt
system_admin.modules.read
system_admin.modules.manage
system_admin.modules.review
```

Phase 2 minimum:

```txt
system_admin.modules.read
system_admin.modules.manage
```

## Module Model

Module definitions should come from declared ERP contracts, not ad-hoc admin input.

```ts
export type ExecutionModule = {
  key: string
  label: string
  description?: string
  category: "core" | "operations" | "finance" | "people" | "platform"
  status: "active" | "preview" | "deprecated"
  owner?: string
}
```

Organization-specific setting:

```ts
export type OrganizationModuleSetting = {
  organizationId: string
  moduleKey: string
  availability: "enabled" | "disabled" | "preview"
  visibleInNavigation: boolean
  updatedByUserId: string
  updatedAt: Date
}
```

## Module Lifecycle

| Status       | Meaning                                                    |
| ------------ | ---------------------------------------------------------- |
| `active`     | Fully supported module.                                    |
| `preview`    | Available but not fully operational.                       |
| `deprecated` | Existing usage may remain, but new rollout is discouraged. |

Organization availability:

| Availability | Meaning                                           |
| ------------ | ------------------------------------------------- |
| `enabled`    | Module is available to the organization.          |
| `disabled`   | Module is unavailable and hidden from normal use. |
| `preview`    | Module is visible but marked as preview.          |

## Module Relationship

```txt
Module
  ├─ Capabilities
  ├─ Permissions
  ├─ Policies
  ├─ Approval Rules
  ├─ Routes
  ├─ Navigation Surfaces
  └─ Readiness Verdict
```

Example:

```txt
HRM

Capabilities
  Employee Records
  Leave Management
  Payroll

Permissions
  hrm.employee.read
  hrm.employee.update
  hrm.leave.approve

Policies
  Payroll Finalization Lock

Approval Rules
  Salary Change Approval
```

## Modules Page

Route:

```txt
/apps/system-admin/modules
```

Purpose:

```txt
Review and configure ERP domain availability, visibility, and readiness.
```

Recommended columns:

```txt
Module
Category
Status
Availability
Visibility
Capabilities
Permissions
Policies
Readiness
Last Updated
Actions
```

## Module Detail View

Should show:

```txt
Module metadata
Organization availability
Navigation visibility
Capability inventory
Permission coverage
Policy coverage
Approval coverage
Audit coverage
Readiness report
Recent module audit history
```

This becomes the ERP domain truth page.

## Module Enablement Flow

```txt
1. Admin selects module
2. Server resolves execution context
3. Server checks `system_admin.modules.manage`
4. Server validates module exists in declared catalog
5. Server validates safety constraints
6. Server updates organization module setting
7. Server writes audit event
8. Workspace navigation / Nexus / command palette consume updated setting
```

Audit action:

```txt
system_admin.module.enable
```

## Module Disable Flow

```txt
1. Admin selects enabled module
2. Server checks `system_admin.modules.manage`
3. Server validates module is not protected
4. Server checks dependency impact
5. Server requires confirmation for critical modules
6. Server updates availability to `disabled`
7. Server writes audit event
8. Navigation and commands hide normal entry points
```

Audit action:

```txt
system_admin.module.disable
```

## Module Visibility Flow

Visibility controls whether the module appears in:

```txt
Workspace navigation
Nexus
Command Palette
Search
Onboarding / Demo Surfaces
```

Important rule:

```txt
Visibility is not security.

Execution Kernel must still enforce access even if UI hides or shows the module.
```

Audit action:

```txt
system_admin.module_visibility.update
```

## Module Readiness

A module should expose a readiness verdict.

```ts
export type ModuleReadinessVerdict =
  | "ready"
  | "warning"
  | "blocked"
```

Recommended checks:

```txt
Capabilities declared
Required permissions exist
Routes exist
Audit coverage exists
Policy coverage exists where needed
Approval coverage exists where needed
No critical diagnostics
Dependencies satisfied
```

Example:

```txt
Inventory

Readiness:
  Warning

Issues:
  Missing audit coverage for stock write-off
  Deprecated stock adjustment capability still visible
```

## Dependency Review

Modules may depend on other modules.

Examples:

```txt
Accounting depends on Contacts
Payroll depends on HRM
Procurement depends on Vendors / Contacts
Inventory Costing depends on Inventory + Accounting
```

Diagnostic example:

```txt
Accounting enabled
Contacts disabled

Verdict:
Blocked readiness
```

## Server Data Loader

```ts
export async function listSystemAdminModules() {
  const context = await requireExecutionContext()

  await requireExecutionPermission(
    context,
    "system_admin.modules.read",
  )

  return listOrganizationModules({
    organizationId: context.organizationId,
  })
}
```

## Server Action Pattern

```ts
export async function updateSystemAdminModuleSetting(
  input: UpdateModuleSettingInput,
) {
  const context = await requireExecutionContext()

  await requireExecutionPermission(
    context,
    "system_admin.modules.manage",
  )

  const parsed = updateModuleSettingInputSchema.parse(input)

  const result = await updateOrganizationModuleSetting({
    organizationId: context.organizationId,
    actorId: context.userId,
    input: parsed,
  })

  await writeExecutionAuditEvent({
    organizationId: context.organizationId,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system_admin.module_setting.update",
    targetType: "module",
    targetId: parsed.moduleKey,
    metadata: {
      availability: parsed.availability,
      visibleInNavigation: parsed.visibleInNavigation,
    },
  })

  return result
}
```

## Zod Schemas

```ts
export const updateModuleSettingInputSchema = z.object({
  moduleKey: z.string().min(1),
  availability: z.enum(["enabled", "disabled", "preview"]),
  visibleInNavigation: z.boolean(),
})
```

## Safety Rules

Modules must enforce:

1. Module definitions come from declared ERP contracts.
2. System Admin cannot invent modules from UI.
3. System Admin module cannot be disabled.
4. Critical modules require confirmation before disablement.
5. Disabled modules are hidden from normal navigation.
6. UI visibility is not security enforcement.
7. Execution Kernel still guards all access.
8. Module changes are organization-scoped.
9. Module changes are audited.
10. Dependency conflicts are reported before change.
11. Readiness verdicts must be visible.
12. Deprecated modules cannot be newly enabled without explicit confirmation.

## Definition of Done

Modules is done when:

* administrators can view the module catalog
* administrators can inspect module metadata
* administrators can enable modules
* administrators can disable modules
* administrators can set modules to preview
* administrators can control navigation visibility
* module availability is organization-scoped
* module readiness verdict is visible
* capability count is visible
* permission coverage is visible
* policy and approval coverage are visible
* dependency issues are visible
* disabled modules are hidden from normal navigation
* System Admin module cannot be disabled
* Execution Kernel still enforces access
* module changes write audit events

## Minimum Tests

```txt
non-admin cannot view modules
non-admin cannot update module setting
module enable writes audit event
module disable writes audit event
system-admin module cannot be disabled
critical module disable requires confirmation
deprecated module enable requires confirmation
disabled module is hidden from workspace navigation
disabled module is hidden from command palette
Execution Kernel still denies unauthorized direct access
module readiness report is generated
dependency conflict creates warning or blocked verdict
```

## Final Architecture Statement

Modules answer:

```txt
What ERP business domains exist, and are they available for this organization?
```

Capabilities answer:

```txt
What functions does each module provide?
```

Permissions answer:

```txt
Who can access those functions?
```

Policies answer:

```txt
When are those functions allowed or blocked?
```

Execution Kernel answers:

```txt
Can this action execute safely right now?
```

Modules is the ERP domain governance surface, not a generic settings page.
