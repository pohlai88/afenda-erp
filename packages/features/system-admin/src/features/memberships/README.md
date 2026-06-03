# Memberships vertical (`@afenda/feature-system-admin`)

Canonical architecture: [`docs/architecture/1006-control-plane.md`](../../../../docs/architecture/1006-control-plane.md) (parent **ARCH-1006**).

Package as-built supplement: [`membership-architecture.md`](./membership-architecture.md) — update when implementation changes; do not delete.

## Template buckets (vertical slice)
| ------ | ------------------- |
| `actions/` | Lifecycle Server Actions (`suspend` / `reactivate` / `remove`) |
| `components/` | Pattern C section + trailing cell + invite form (Identity hub) |
| `contracts/` | Row types, invite DTOs |
| `data/` | Tenant queries, page model, directory view audit |
| `events/` | `tenant.role.changed` webhook catalog |
| `policies/` | Capability re-exports + lifecycle invariant checks |
| `schemas/` | Zod parsers for status + invite payloads |
| `surface/` | Metadata list builders, UI copy, gallery fixtures (governed config only) |

Validate after scaffold or slice edits:

```bash
pnpm validate:feature-entry --feature system-admin --slice memberships
```

## Public doors (consumers import these only)

| Door | Memberships exports |
| ---- | ------------------- |
| `@afenda/feature-system-admin/metadata` | `buildMembersListSurface`, `systemAdminMembersSurfaceKey`, gallery/copy |
| `@afenda/feature-system-admin/server` | `SystemAdminMembershipsSection`, `buildSystemAdminMembershipsPageModel`, lifecycle actions |
| `@afenda/feature-system-admin/client` | `SystemAdminMembershipTrailingCell`, `InviteMemberForm` |
| `@afenda/feature-system-admin` | Neutral contracts/schemas only when needed |

## App integration

Route adapter: `apps/erp/src/lib/system-admin-sections/memberships.server.tsx` → `/system-admin/memberships`.

Package tests: `packages/features/system-admin/tests/unit/system-admin.memberships*.test.ts`, `tests/gallery/system-admin-memberships-surfaces.gallery.test.ts`.
