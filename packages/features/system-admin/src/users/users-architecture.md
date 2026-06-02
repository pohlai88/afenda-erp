**Parent:** [`docs/architecture/1006-control-plane.md`](../../../../docs/architecture/1006-control-plane.md)

**Vertical supplement:** this file.

### 9.1 Users

## Definition

Users manages human access into the organization.

It owns user invitation, organization membership entry, account status visibility, access inspection, and removal from the organization.

Users does not own permission logic directly. Roles, permissions, and policy evaluation remain governed through Roles, Permissions, and the Execution Kernel.

## Owns

Users owns:

* invite user
* resend invitation
* cancel invitation
* view user status
* view invitation status
* view organization membership status
* inspect user access summary
* deactivate / suspend user from organization
* reactivate user
* remove user from organization
* view user’s assigned roles
* link to role assignment surface

## Does Not Own

Users does not own:

* permission catalog
* role definition
* policy rules
* module capability definitions
* low-level authentication provider implementation
* global identity provider account deletion
* Execution Kernel access enforcement

## Example Permission

```txt
system_admin.users.manage
```

Recommended split:

```txt
system_admin.users.read
system_admin.users.invite
system_admin.users.manage
system_admin.users.remove
system_admin.users.inspect_access
```

For Phase 1, keep it simple:

```txt
system_admin.users.read
system_admin.users.manage
```

## User Status Model

```ts
export type SystemAdminUserStatus =
  | "invited"
  | "active"
  | "suspended"
  | "removed"
```

Recommended meaning:

| Status      | Meaning                                                               |
| ----------- | --------------------------------------------------------------------- |
| `invited`   | Invitation sent, user has not accepted yet.                           |
| `active`    | User can access the organization based on assigned roles.             |
| `suspended` | User remains recorded but cannot access the organization.             |
| `removed`   | User is no longer part of the organization. Historical audit remains. |

## Users Page

Route:

```txt
/[locale]/o/[orgSlug]/apps/system-admin/users
```

Primary purpose:

```txt
Show all organization users and allow authorized admins to manage access.
```

Recommended table columns:

```txt
User
Email
Status
Membership
Roles
Last active
Invited at
Joined at
Actions
```

Recommended actions:

```txt
Invite user
Resend invitation
Cancel invitation
Suspend user
Reactivate user
Remove from organization
Inspect access
View assigned roles
```

## Invite User Flow

```txt
1. Admin opens invite user dialog
2. Enters email and optional initial role
3. Server resolves execution context
4. Server checks `system_admin.users.manage`
5. Server validates email
6. Server checks duplicate membership / pending invite
7. Server creates invitation or membership record
8. Server optionally assigns initial role
9. Server writes audit event
10. UI revalidates users page
```

Audit action:

```txt
system_admin.user.invite
```

## Resend Invitation Flow

```txt
1. Admin selects pending invited user
2. Server checks `system_admin.users.manage`
3. Server confirms invitation is still pending
4. Server resends invite
5. Server writes audit event
```

Audit action:

```txt
system_admin.user.invitation_resend
```

## Suspend User Flow

```txt
1. Admin selects active user
2. Server checks `system_admin.users.manage`
3. Server prevents suspending self when unsafe
4. Server prevents suspending last active owner/admin
5. Server updates membership status to `suspended`
6. Server writes audit event
```

Audit action:

```txt
system_admin.user.suspend
```

## Reactivate User Flow

```txt
1. Admin selects suspended user
2. Server checks `system_admin.users.manage`
3. Server restores membership status to `active`
4. Server writes audit event
```

Audit action:

```txt
system_admin.user.reactivate
```

## Remove User Flow

```txt
1. Admin selects user
2. Server checks `system_admin.users.manage`
3. Server requires confirmation
4. Server prevents removing last active owner/admin
5. Server updates membership status to `removed`
6. Server removes active role assignments or marks them inactive
7. Server writes audit event
```

Audit action:

```txt
system_admin.user.remove
```

## Inspect Access Flow

Purpose:

```txt
Show how the user currently receives access.
```

Access inspection should show:

```txt
Assigned roles
Effective permissions
Enabled modules
Accessible capabilities
Blocked capabilities
Suspended/removed status impact
```

Important:

```txt
Inspect Access is read-only.
It explains access; it does not enforce access.
Execution Kernel remains the enforcement authority.
```

## Server Data Loader

```ts
export async function listSystemAdminUsers() {
  const context = await requireExecutionContext()

  await requireExecutionPermission(context, "system_admin.users.read")

  return listOrganizationUsers({
    organizationId: context.organizationId,
  })
}
```

## Server Action Pattern

```ts
export async function inviteSystemAdminUser(input: InviteUserInput) {
  const context = await requireExecutionContext()

  await requireExecutionPermission(context, "system_admin.users.manage")

  const parsed = inviteUserInputSchema.parse(input)

  const result = await inviteUserToOrganization({
    organizationId: context.organizationId,
    actorId: context.userId,
    email: parsed.email,
    roleIds: parsed.roleIds,
  })

  await writeExecutionAuditEvent({
    organizationId: context.organizationId,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system_admin.user.invite",
    targetType: "user_invitation",
    targetId: result.invitationId,
    metadata: {
      email: parsed.email,
      roleIds: parsed.roleIds ?? [],
    },
  })

  return result
}
```

## Zod Schemas

```ts
export const inviteUserInputSchema = z.object({
  email: z.string().email(),
  roleIds: z.array(z.string().min(1)).default([]),
})

export const updateUserMembershipStatusInputSchema = z.object({
  membershipId: z.string().min(1),
  status: z.enum(["active", "suspended", "removed"]),
})

export const resendInvitationInputSchema = z.object({
  invitationId: z.string().min(1),
})

export const inspectUserAccessInputSchema = z.object({
  membershipId: z.string().min(1),
})
```

## Safety Rules

Users must enforce:

1. All reads are organization-scoped.
2. All mutations are permission-guarded.
3. Duplicate invitations are blocked.
4. Duplicate memberships are blocked.
5. Removed users cannot be reactivated casually without explicit flow.
6. Suspended users cannot access organization surfaces.
7. Last active owner/admin cannot be suspended or removed.
8. Admin cannot accidentally suspend/remove themselves if it would lock out the organization.
9. Sensitive actions require confirmation.
10. Every mutation writes audit evidence.

## Definition of Done

Users is done when:

* authorized admins can view organization users
* authorized admins can invite users
* authorized admins can resend pending invitations
* authorized admins can suspend users
* authorized admins can reactivate users
* authorized admins can remove users from the organization
* admins can inspect a user’s access summary
* duplicate invite is blocked
* last admin/owner protection works
* all mutations write audit evidence
* all queries are organization-scoped
* non-admin users are denied server-side
* UI has empty, loading, and access-denied states

## Minimum Tests

```txt
non-admin cannot view users
non-admin cannot invite user
duplicate invite is blocked
invite user writes audit event
resend invite only works for pending invite
suspend user writes audit event
reactivate user writes audit event
remove user writes audit event
cannot suspend last active admin
cannot remove last active owner
inspect access returns roles and effective permissions
```

## As-built (ARCH-1006 integration)

### Route split

| Route | Package area | UI pattern |
| ----- | ------------ | ---------- |
| `/system-admin/users` | `users/` | Pattern C — `system-admin.users.list` + `SystemAdminInviteUserDialog` |
| `/system-admin/identity` | `users/` hub + `permissions/` overrides | Pattern C role overrides + domain links; optional `InviteMemberForm` when `identity.write` without `users.manage` |
| `/system-admin/memberships` | `memberships/` | Pattern C — `system-admin.members.list` (membership lifecycle, not invitations) |

### Metadata surfaces

- **Users list:** `buildUsersListSurface` → `system-admin.users.list` (`users/surface/system-admin.users-list.surface.ts`)
- **Trailing metadata:** `resolveSystemAdminUserRowTrailingAction` (`users/surface/system-admin.users-list-trailing.shared.ts`)
- **Gallery:** `systemAdminUsersGalleryRows` + `tests/gallery/system-admin-users-surfaces.gallery.test.ts`

### Server actions

| Action | Capability | Audit |
| ------ | ---------- | ----- |
| `inviteSystemAdminUser` | `system-admin.users.manage` | `system-admin.user.invite` |
| `resendSystemAdminInvitation` / `cancelSystemAdminInvitation` | `system-admin.users.manage` | resend / cancel |
| `suspendSystemAdminUser` / `reactivateSystemAdminUser` / `removeSystemAdminUser` | `system-admin.users.manage` | suspend / reactivate / remove |
| `inspectSystemAdminUserAccessAction` | `system-admin.users.read` | — |
| `inviteMemberAction` | `system-admin.identity.write` (or broader identity write bundle) | `system-admin.user.invite` audit + webhook; uses same duplicate guard as Users |

### Last active

`listActorLastActivityAt` (`@afenda/db` audit) + `formatSystemAdminUserLastActive` until session telemetry exists. Invited rows show `Not joined`.

### Client export door

`SystemAdminUserTrailingCell`, `SystemAdminInviteUserDialog`, `InviteMemberForm`, `SystemAdminRoleAssignmentActions` from `@afenda/feature-system-admin/client`.

### Identity read repository

`users/data/system-admin.identity.repository.server.ts` is the feature door for `listTenantMembers`, `listOrganizationInvitations`, and `listRoleOverridesForOrganization`. Overview, memberships, roles, billing, and users queries import through it — not `@afenda/db` directly.

### Destructive confirmations

Lifecycle mutations use `SystemAdminDestructiveConfirmButton` (`@afenda/ui` `AlertDialog`) with copy from `systemAdminUserTrailingConfirms` — aligned to governed `ActionDescriptor.confirm` shape, not `window.confirm`.

