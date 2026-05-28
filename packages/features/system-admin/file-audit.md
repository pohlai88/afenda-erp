# System Admin File Audit

## Current Status

- Package root remains `packages/features/system-admin`.
- Root export door exposes metadata and route contracts only.
- `./client` remains browser-safe and exports client components, DTOs, and serializable catalogs.
- `./server` owns server-only actions, data access, governed surfaces, policies, and domain facades.

## Domain Buckets

- `overview/`: Phase 1 overview vertical with server snapshot and page component.
- `users/`: user invitation and user access review facade.
- `memberships/`: membership list and role assignment facade.
- `roles/`: role override facade.
- `permissions/`: permission catalog facade.
- `modules/`: tenant module settings facade.
- `capabilities/`: execution capability metadata facade.
- `policies/`: tenant policy settings facade.
- `approvals/`: tenant approval settings facade.
- `audit-viewer/`: audit and retention facade.
- `security/`: tenant security settings facade.
- `organization/`: organization defaults facade.
- `diagnostics/`: drift, cron, coverage, and spend evidence facade.

## Compatibility Buckets Retained

- `actions/`, `data/`, `schemas/`, `surfaces/`, `components/`, `contracts/`, `events/`, and `policies/` remain because existing routes and tests import them.
- `/system-admin/identity` and `/system-admin/settings` remain compatibility pages.
- Broad permissions such as `system-admin.identity.write` and `system-admin.settings.write` remain compatibility gates while granular keys roll out.

## Moved Or Normalized In This Pass

- Added granular System Admin route constants.
- Added execution-kernel backed System Admin policy helpers.
- Added durable tenant stores for module, policy, approval, security, and organization default settings.
- Added governed Pattern C surfaces for permissions, modules, capabilities, policies, approvals, security, organization, and diagnostics.
- Added domain pages under the existing `/system-admin/*` route family.
- Added Phase 1 vertical bucket sets for `overview`, `users`, `memberships`, and `roles`.
- Phase 1 role assignment uses the existing single-role `organization_memberships.role` model because durable `roles` and `role_assignments` tables do not exist yet.
- Added durable membership status on `organization_memberships` so suspend/reactivate/remove can be represented without introducing a new role-assignment schema.

## Stale Or Empty Buckets

- No stale source bucket was removed in this pass because the compatibility routes still consume the existing broad buckets.
- Future cleanup can move implementation files from broad technical buckets into domain buckets once all imports use the domain facades.
