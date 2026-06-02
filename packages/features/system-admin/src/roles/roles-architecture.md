**Parent:** [`docs/architecture/1006-control-plane.md`](../../../../docs/architecture/1006-control-plane.md)

**Vertical supplement:** this file.

### 9.3 Roles

## Definition

Roles define organizational authority.

A role is a governed bundle of permissions that can be assigned to memberships to grant access to ERP capabilities.

Roles exist to simplify administration, governance, onboarding, auditing, and access review.

Roles do not directly enforce access.

The Execution Kernel resolves effective permissions and performs enforcement.

## Owns

Roles owns:

* role creation
* role editing
* role deprecation
* role activation
* role assignment
* role removal
* role permission bundle review
* role access review
* role usage analysis
* role inheritance visibility (optional future)

## Does Not Own

Roles does not own:

* permission enforcement
* capability execution
* policy evaluation
* organization membership lifecycle
* user identity management
* authentication

Those belong to:

```txt
Execution Kernel
Memberships
Users
Policies
```

## Example Permission

```txt
system_admin.roles.manage
```

Recommended split:

```txt
system_admin.roles.read
system_admin.roles.create
system_admin.roles.manage
system_admin.roles.assign
system_admin.roles.deprecate
```

Phase 1:

```txt
system_admin.roles.read
system_admin.roles.manage
```

## Role Model

```ts
export type Role = {
  id: string

  organizationId: string

  key: string
  name: string
  description?: string

  status:
    | "active"
    | "deprecated"

  createdAt: Date
  updatedAt: Date
}
```

## Role Status

| Status     | Meaning                                              |
| ---------- | ---------------------------------------------------- |
| active     | Available for assignment                             |
| deprecated | Existing assignments remain, new assignments blocked |

Important:

```txt
Deprecation does not remove historical authority.

It prevents future assignment.
```

## Role Permission Bundle

A role contains permissions.

```ts
type RolePermissionAssignment = {
  roleId: string
  permissionKey: string
}
```

Example:

```txt
Role
  HR Manager

Permissions
  hrm.employee.read
  hrm.employee.update
  hrm.compensation.read
  hrm.leave.approve
```

## Authority Chain

```txt
Role
  ↓

Permission Bundle
  ↓

Capability Access
  ↓

Execution Kernel Verdict
```

The role itself never grants access.

The permission bundle does.

The Execution Kernel evaluates it.

## Membership Assignment

Roles are assigned to memberships.

Not users.

Correct:

```txt
Membership
  ↓
Role
  ↓
Permissions
```

Incorrect:

```txt
User
  ↓
Permission
```

## Role Categories

Recommended categories:

### Organization Roles

```txt
Owner
Admin
Auditor
```

### Management Roles

```txt
Finance Manager
HR Manager
Sales Manager
Operations Manager
Warehouse Manager
```

### Operational Roles

```txt
Finance Officer
HR Officer
Sales Executive
Purchasing Officer
Storekeeper
```

### Read-only Roles

```txt
Viewer
Executive Viewer
Auditor
```

## Roles Page

Route:

```txt
/ apps / system-admin / roles
```

Purpose:

```txt
Manage authority bundles.
```

Recommended columns:

```txt
Role
Key
Status
Permissions
Assigned Members
Created
Updated
Actions
```

## Role Detail View

Should show:

```txt
Role metadata
Permission bundle
Assigned memberships
Accessible capabilities
Audit history
```

This becomes the authority truth page.

## Role Creation Flow

```txt
1. Admin creates role
2. Server validates role key
3. Server validates uniqueness
4. Server saves role
5. Server writes audit event
```

Audit action:

```txt
system_admin.role.create
```

## Role Update Flow

```txt
1. Admin edits role
2. Server validates change
3. Server updates role
4. Server writes audit event
```

Audit action:

```txt
system_admin.role.update
```

## Role Deprecation Flow

```txt
1. Admin deprecates role
2. Existing assignments remain
3. New assignments blocked
4. Audit event recorded
```

Audit action:

```txt
system_admin.role.deprecate
```

## Role Assignment Flow

```txt
1. Admin selects membership
2. Admin selects role
3. Server validates role active
4. Server validates membership active
5. Assignment saved
6. Audit event recorded
```

Audit action:

```txt
system_admin.role_assignment.create
```

## Role Removal Flow

```txt
1. Admin selects assignment
2. Server validates protection rules
3. Assignment removed
4. Audit event recorded
```

Audit action:

```txt
system_admin.role_assignment.remove
```

## Permission Bundle Review

Purpose:

```txt
Help administrators understand:

What does this role actually grant?
```

Example:

```txt
Role
  HR Manager

Permissions
  hrm.employee.read
  hrm.employee.update
  hrm.leave.approve

Capabilities
  Employee Records
  Leave Approval
  Organization Chart
```

This is one of the most important admin views.

## Access Review

Show:

```txt
Role
 ↓

Permissions
 ↓

Capabilities
 ↓

Assigned Memberships
```

Example:

```txt
Finance Manager

Permissions
  accounting.invoice.approve
  accounting.payment.approve

Capabilities
  Invoice Approval
  Payment Authorization

Assigned Members
  4
```

## Recommended System Roles

Minimum seed set:

```txt
owner
admin
auditor
manager
operator
viewer
```

Module-specific roles:

```txt
finance-manager
finance-officer

hr-manager
hr-officer

sales-manager
sales-executive

warehouse-manager
warehouse-operator
```

## Server Data Loader

```ts
export async function listSystemAdminRoles() {
  const context =
    await requireExecutionContext()

  await requireExecutionPermission(
    context,
    "system_admin.roles.read",
  )

  return listOrganizationRoles({
    organizationId: context.organizationId,
  })
}
```

## Zod Schemas

```ts
export const createRoleInputSchema =
  z.object({
    key: z.string().min(2),
    name: z.string().min(2),
    description: z.string().optional(),
  })

export const updateRoleInputSchema =
  z.object({
    roleId: z.string().min(1),
    name: z.string().min(2),
    description: z.string().optional(),
  })

export const assignRoleInputSchema =
  z.object({
    membershipId: z.string().min(1),
    roleId: z.string().min(1),
  })

export const deprecateRoleInputSchema =
  z.object({
    roleId: z.string().min(1),
  })
```

## Safety Rules

Roles must enforce:

1. Role keys are unique within organization.
2. Deprecated roles cannot be newly assigned.
3. Duplicate role assignment is blocked.
4. Removed membership cannot receive roles.
5. Suspended membership cannot receive roles.
6. Last owner role cannot be removed unsafely.
7. System roles require elevated confirmation.
8. Role changes are audited.
9. Permission bundle changes are audited.
10. Organization scoping is mandatory.

## Definition of Done

Roles is done when:

* administrators can create roles
* administrators can edit roles
* administrators can deprecate roles
* administrators can assign roles
* administrators can remove role assignments
* permission bundles are visible
* capability coverage is visible
* assigned memberships are visible
* audit history is visible
* deprecated roles cannot be newly assigned
* duplicate assignments are blocked
* all actions are audited

## Minimum Tests

```txt
non-admin cannot view roles
non-admin cannot create roles
role creation writes audit event
role update writes audit event
role deprecation writes audit event
deprecated role cannot be assigned
duplicate assignment blocked
removed membership cannot receive role
last owner protection works
permission bundle review resolves capabilities correctly
```

## Final Architecture Statement

Users answer:

```txt
Who is this person?
```

Memberships answer:

```txt
How does this person belong to this organization?
```

Roles answer:

```txt
What authority bundle should they receive?
```

Permissions answer:

```txt
What atomic access is granted?
```

Execution Kernel answers:

```txt
Can this action execute right now?
```

