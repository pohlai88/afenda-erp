**Parent:** [`docs/architecture/1006-control-plane.md`](../../../../docs/architecture/1006-control-plane.md)

**Vertical supplement:** this file.

### 9.4 Permissions

## Definition

Permissions define the smallest enforceable access units in Afenda.

A permission answers:

```txt
What atomic action or access right can be granted?
```

Permissions are consumed by Roles and enforced by the Execution Kernel.

System Admin may display, group, review, and assign permissions through roles, but it should not casually invent arbitrary permission strings.

## Owns

Permissions owns:

* permission catalog display
* permission grouping
* permission-to-capability mapping review
* permission assignment through role bundles
* permission coverage review
* orphan permission detection
* missing permission detection
* permission risk classification
* permission usage review

## Does Not Own

Permissions does not own:

* runtime access enforcement
* capability definition
* module definition
* policy evaluation
* user identity
* membership lifecycle
* direct user permission assignment by default

Those belong to:

```txt
Execution Kernel
Capabilities
Modules
Policies
Users
Memberships
Roles
```

## Example Permission

```txt
system_admin.permissions.manage
```

Recommended split:

```txt
system_admin.permissions.read
system_admin.permissions.manage
system_admin.permissions.review
```

Phase 2 minimum:

```txt
system_admin.permissions.read
system_admin.permissions.manage
```

## Permission Model

```ts
export type ExecutionPermission = {
  key: string
  moduleKey: string
  label: string
  description?: string
  group: string
  riskLevel: "low" | "medium" | "high" | "critical"
  status: "active" | "deprecated"
}
```

## Permission Key Convention

Use stable, action-oriented keys:

```txt
<module>.<resource>.<action>
```

Examples:

```txt
hrm.employee.read
hrm.employee.update
hrm.compensation.read
hrm.compensation.update
inventory.stock_adjustment.create
accounting.invoice.approve
system_admin.users.manage
```

Avoid vague permissions:

```txt
admin
superuser
manage_all
edit
access
full_control
```

## Permission Source of Truth

Permissions should come from declared contracts.

Correct:

```txt
Execution capability declares required permission.
Permission catalog registers that permission.
Role bundles assign that permission.
Execution Kernel enforces that permission.
```

Incorrect:

```txt
Admin types random permission into UI.
System stores it.
Nobody knows what it protects.
```

## Permission Relationship

```txt
Permission
  belongs to Module
  may guard Capability
  may be included in Role
  may appear in Audit Coverage
```

Relationship chain:

```txt
Role
  ↓
Permission
  ↓
Capability
  ↓
Execution Kernel verdict
```

## Permissions Page

Route:

```txt
/apps/system-admin/permissions
```

Purpose:

```txt
Review the access catalog and understand what permissions exist, where they are used, and which roles grant them.
```

Recommended columns:

```txt
Permission
Module
Group
Risk
Status
Capabilities
Roles
Coverage
Actions
```

## Permission Detail View

Should show:

```txt
Permission metadata
Required by capabilities
Included in roles
Assigned memberships through roles
Risk level
Audit actions related to this permission
Coverage verdict
```

This answers:

```txt
What does this permission unlock?
Who receives it?
Is it properly covered?
```

## Permission Grouping

Recommended groups:

```txt
Read
Create
Update
Approve
Delete / Remove
Configure
Export
Security
Audit
Admin
```

Alternative grouping by module:

```txt
System Admin
HRM
Contacts
Inventory
Accounting
Orbit
Nexus
```

Best UI should support both:

```txt
Group by module
Group by action type
Group by risk level
```

## Permission Risk Levels

| Risk     | Meaning                                               |
| -------- | ----------------------------------------------------- |
| low      | Read or low-impact access                             |
| medium   | Normal operational update                             |
| high     | Financial, HR, security, or destructive action        |
| critical | Admin, security, payment, payroll, owner-level action |

Examples:

```txt
contacts.company.read → low
inventory.stock_adjustment.create → medium
hrm.compensation.update → high
system_admin.security.manage → critical
```

## Permission Assignment

Default rule:

```txt
Permissions are assigned to roles, not directly to users.
```

Correct:

```txt
Membership → Role → Permissions
```

Avoid:

```txt
User → Permission
```

Direct permission grants should be avoided in Phase 2. If supported later, they must be exceptional, audited, expiry-based, and visible in diagnostics.

## Permission Bundle Review

Roles should expose permission bundles.

Example:

```txt
Role: HR Manager

Permissions:
- hrm.employee.read
- hrm.employee.update
- hrm.leave.approve
- hrm.compensation.read

Capabilities unlocked:
- Employee Records
- Leave Approval
- Compensation Review
```

## Permission Coverage Verdict

```ts
export type PermissionCoverageVerdict =
  | "covered"
  | "orphan"
  | "missing_capability"
  | "deprecated"
  | "unassigned"
  | "overprivileged"
```

Meaning:

| Verdict            | Meaning                                                          |
| ------------------ | ---------------------------------------------------------------- |
| covered            | Permission is active and used by declared capabilities or roles. |
| orphan             | Permission exists but no capability uses it.                     |
| missing_capability | Capability refers to permission not found in catalog.            |
| deprecated         | Permission should not be newly assigned.                         |
| unassigned         | Permission exists but no role includes it.                       |
| overprivileged     | Permission is high-risk and assigned too broadly.                |

## Coverage Review Checks

Permissions should detect:

```txt
Permission exists but no capability uses it
Capability requires missing permission
Deprecated permission still assigned to active role
High-risk permission assigned to broad role
Permission has no risk classification
Permission has no module owner
Permission has no description
```

## Server Data Loader

```ts
export async function listSystemAdminPermissions() {
  const context = await requireExecutionContext()

  await requireExecutionPermission(
    context,
    "system_admin.permissions.read",
  )

  return listPermissionCatalogWithCoverage({
    organizationId: context.organizationId,
  })
}
```

## Permission Bundle Update Flow

```txt
1. Admin opens role permission bundle
2. Admin adds or removes permissions
3. Server checks `system_admin.permissions.manage`
4. Server validates permission keys exist in catalog
5. Server validates role is active
6. Server prevents unsafe removal of final owner/admin authority
7. Server updates role permission bundle
8. Server writes audit event
9. Diagnostics can detect any new coverage problems
```

Audit action:

```txt
system_admin.permission_bundle.update
```

## Zod Schemas

```ts
export const updateRolePermissionBundleInputSchema =
  z.object({
    roleId: z.string().min(1),
    permissionKeys: z.array(z.string().min(1)),
  })
```

Better hardened version:

```ts
export const permissionKeySchema =
  z.string()
    .min(3)
    .regex(/^[a-z0-9_]+(\.[a-z0-9_]+){2,}$/)

export const updateRolePermissionBundleInputSchema =
  z.object({
    roleId: z.string().min(1),
    permissionKeys: z.array(permissionKeySchema),
  })
```

## Safety Rules

Permissions must enforce:

1. Permissions come from declared catalog.
2. UI cannot create random permission strings.
3. Permissions are assigned through roles.
4. Deprecated permissions cannot be newly added to roles.
5. High-risk permissions require confirmation.
6. Critical permissions require elevated confirmation.
7. Permission changes are audited.
8. Role permission changes preserve last-owner/admin protection.
9. Coverage gaps are visible.
10. Direct user permissions are avoided in Phase 2.

## Definition of Done

Permissions is done when:

* administrators can view the permission catalog
* permissions are grouped by module/action/risk
* permissions show linked capabilities
* permissions show linked roles
* orphan permissions are flagged
* missing permission references are flagged
* deprecated permissions are visible
* permission bundles can be reviewed
* role permission bundles can be updated
* random permission creation is blocked
* high-risk changes require confirmation
* all changes write audit events

## Minimum Tests

```txt
non-admin cannot view permissions
non-admin cannot update permission bundle
random permission key is rejected
deprecated permission cannot be newly assigned
permission bundle update writes audit event
capability referencing missing permission is flagged
orphan permission is flagged
high-risk permission requires confirmation
last owner/admin authority cannot be removed
```

## Final Architecture Statement

Permissions answer:

```txt
What atomic access exists?
```

Roles answer:

```txt
Which permissions are bundled into authority?
```

Memberships answer:

```txt
Who receives the authority in this organization?
```

Capabilities answer:

```txt
What ERP function does this permission unlock?
```

Execution Kernel answers:

```txt
Can this action execute right now?
```

