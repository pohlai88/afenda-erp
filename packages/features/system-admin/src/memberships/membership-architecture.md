**Parent:** [`docs/architecture/011-system-admin-enterprise-architecture.md`](../../../../docs/architecture/011-system-admin-enterprise-architecture.md)

**Canonical supplement:** [`docs/architecture/011-system-admin-memberships-architecture.md`](../../../../docs/architecture/011-system-admin-memberships-architecture.md)

### 9.2 Memberships

## Definition

Memberships manages how a person belongs to an organization.

It owns membership scope, team assignment visibility, status linkage, and membership review for active organization participants.

Memberships does not own user invitation, identity provider accounts, or permission enforcement. Users owns invitation lifecycle; Roles owns authority bundles; the Execution Kernel resolves and enforces access.

## Owns

Memberships owns:

* view organization memberships
* review membership status
* suspend membership from organization
* reactivate suspended membership
* remove membership from organization
* review role coverage on memberships
* link to role assignment surfaces
* membership list search and filters

## Does Not Own

Memberships does not own:

* user invitation or pending invite lifecycle
* resend / cancel invitation flows
* permission catalog or bundle definition
* role creation or deprecation
* policy evaluation
* authentication or session management
* Execution Kernel access enforcement

Those belong to:

```txt
Users
Roles
Permissions
Execution Kernel
@afenda/auth
```

## Example Permission

```txt
system-admin.memberships.manage
```

Recommended split:

```txt
system-admin.memberships.read
system-admin.memberships.manage
```

Phase 1 (implemented):

```txt
system-admin.memberships.read
system-admin.memberships.manage
```

## Membership Status Model

```ts
export type SystemAdminMembershipStatus =
  | "active"
  | "suspended"
  | "removed"
```

Recommended meaning:

| Status      | Meaning                                                               |
| ----------- | --------------------------------------------------------------------- |
| `active`    | Member can access the organization based on assigned roles.           |
| `suspended` | Member remains recorded but cannot access the organization.           |
| `removed`   | Member is no longer part of the organization. Historical audit remains. |

## Memberships Page

Route:

```txt
/system-admin/memberships
```

Primary purpose:

```txt
Review organizational participation and membership lifecycle for the active tenant.
```

Invitations and pending users remain on `/system-admin/users`. Memberships focuses on joined participants and their role coverage.

Recommended table columns:

```txt
Member
Email
Status
Primary role
Role count
Joined at
Updated at
Actions
```

Recommended actions:

```txt
Suspend membership
Reactivate membership
Remove membership
Assign role (via Roles surface)
Remove role assignment (via Roles surface)
```

## Suspend Membership Flow

```txt
1. Admin selects active membership
2. Server checks `system-admin.memberships.manage`
3. Server prevents unsafe self-suspension / last owner protection
4. Server updates membership status to `suspended`
5. Server writes audit event
```

Audit action:

```txt
system-admin.membership.suspend
```

## Reactivate Membership Flow

```txt
1. Admin selects suspended membership
2. Server checks `system-admin.memberships.manage`
3. Server restores membership status to `active`
4. Server writes audit event
```

Audit action:

```txt
system-admin.membership.activate
```

## Remove Membership Flow

```txt
1. Admin selects membership
2. Server checks `system-admin.memberships.manage`
3. Server requires confirmation
4. Server prevents removing last active owner/admin
5. Server updates membership status to `removed`
6. Server writes audit event
```

Audit action:

```txt
system-admin.membership.remove
```

## Server Data Loader

```ts
export async function buildSystemAdminMembershipsPageModel(input: {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  searchParams?: Record<string, string | string[] | undefined>;
  limit?: number;
}) {
  // Tenant-scoped list + toolbar filters + directory view audit
  return { memberships, searchValue, statusFilter, roleFilter, totalCount };
}
```

## Safety Rules

Memberships must enforce:

1. All reads are organization-scoped.
2. All mutations are permission-guarded.
3. Suspended memberships cannot access organization surfaces.
4. Removed memberships cannot be casually reactivated without explicit flow.
5. Last active owner/admin cannot be suspended or removed.
6. Sensitive actions require confirmation.
7. Every mutation writes audit evidence.
8. Role assignment/removal uses Roles gates (`system-admin.roles.manage`).

## As-built (Phase 1)

| Capability | Status | Implementation |
| ---------- | ------ | -------------- |
| Membership catalog list | Done | `buildMembersListSurface` + `GovernedPatternCListSection` on `/system-admin/memberships` |
| Status filters + search | Done | `buildSystemAdminMembershipsPageModel` with `membersQ` / `membersStatus` / `membersRole` + audit `system-admin.membership_directory.view` |
| Suspend / reactivate / remove | Done | `system-admin.memberships.actions.server.ts` + `assertSystemAdminMembershipStatusChangeAllowed` |
| Role assignment | Done | Trailing cells → Roles assign/remove; `tenant.role.changed` webhook on role mutations |
| Self / removed guards | Done | `policies/` pre-check + `@afenda/db` last-admin guard |
| Invitations | Deferred to Users | Lifecycle alert links to `/system-admin/users` |
| Teams / employment columns | Deferred | Phase 1: `primaryRole`, `roleCount`, joined/updated timestamps |

### Metadata surfaces

- **Memberships list:** `buildMembersListSurface` → `system-admin.members.list` (primary role links to `/system-admin/roles`)
- **Trailing:** `resolveSystemAdminMembershipRowTrailingAction` + `SystemAdminMembershipTrailingCell`
- **Copy / gallery:** `systemAdminMembershipsUiCopy`, `systemAdminMembershipsGalleryRows`

### Public doors

| Door | Exports |
| ---- | ------- |
| `./metadata` | `buildMembersListSurface`, `systemAdminMembersSurfaceKey`, copy, gallery rows |
| `./server` | `SystemAdminMembershipsSection`, `buildSystemAdminMembershipsPageModel`, lifecycle actions |
| `./client` | `SystemAdminMembershipTrailingCell`, `InviteMemberForm` |

### Data boundary

`listSystemAdminMemberships` uses `users/data/system-admin.identity.repository.server.ts` — not `@afenda/db` from the slice.

### Last owner/admin protection

`assertSystemAdminMembershipStatusChangeAllowed` (feature policy) plus `@afenda/db` `updateTenantMembershipStatus`.

## Definition of Done

Memberships is done when:

* authorized admins can view organization memberships
* authorized admins can suspend memberships
* authorized admins can reactivate memberships
* authorized admins can remove memberships
* role coverage is visible per membership
* last admin/owner protection works
* all mutations write audit evidence
* all queries are organization-scoped
* non-admin users are denied server-side
* UI has empty, loading, and access-denied states

## Minimum Tests

```txt
non-admin cannot view memberships
non-admin cannot suspend membership
suspend membership writes audit event
reactivate membership writes audit event
remove membership writes audit event
cannot suspend last active admin
cannot remove last active owner
membership list surface serializes for Pattern C
```

## Final Architecture Statement

Users answer:

```txt
Who is this person, and how do they enter the organization?
```

Memberships answer:

```txt
How does this person currently belong to this organization?
```

Roles answer:

```txt
What authority bundle should they receive?
```

Execution Kernel answers:

```txt
Can this action execute right now?
```

