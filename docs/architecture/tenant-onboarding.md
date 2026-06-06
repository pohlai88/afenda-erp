# Tenant Onboarding Architecture

## Decision

Do **not** establish a dedicated onboarding package.

Keep onboarding as an app-owned composition in `apps/erp` because it is:

- a thin authentication-adjacent UX surface
- a one-time tenant bootstrap flow
- tightly coupled to ERP routing and workspace guards
- already backed by shared domain logic in `@afenda/db`, `@afenda/kernel`, and `@afenda/metadata-ui`

Create a dedicated package only if onboarding becomes a reusable, multi-app domain with its own commands, read models, and lifecycle outside the ERP shell.

## Problem Observed

Authenticated users without an active organization were being routed back to sign-in because the workspace layout required tenant context before deciding whether the user was actually logged in.

That created a loop:

1. Neon session exists
2. no default organization exists yet
3. workspace guard returns null
4. app redirects to sign-in

## Correct Flow

1. `apps/erp/src/app/(workspace)/layout.tsx` checks both Neon session and workspace context.
2. If a Neon session exists but no tenant context exists, redirect to `/onboarding`.
3. `apps/erp/src/routes/onboarding-route.server.tsx` renders a single-screen tenant bootstrap surface with app-owned styling.
4. `POST /api/internal/v1/onboarding/bootstrap` submits the workspace name (bypasses page proxy; returns HTTP redirects).
5. `@afenda/db/bootstrapOrganizationForUser()` creates the organization, owner membership, default organization, audit entries, and ERP seed data.
6. Redirect to `/dashboard` after bootstrap succeeds.

## Boundary Rules

- Auth decision: server-side only.
- Tenant bootstrap write: internal API route handler only (`/api/internal/v1/onboarding/bootstrap`).
- Tenant creation and seeding: shared domain logic in `@afenda/db`.
- UI rendering: app-owned onboarding composition in `apps/erp` (not metadata-ui steppers/cards).
- No self-fetching `/api` from the onboarding page.
- No business logic in `apps/erp/src/lib/`.

## Why No Dedicated Package

A dedicated package would duplicate an already-shared flow without improving reuse:

- the form metadata is app-specific
- the redirect behavior is app-specific
- the write path already exists in shared domain code
- the UI is a single onboarding screen, not a reusable product surface

The app should compose the shared domain, not wrap it in another package just to move files around.

## Stabilization Notes

- Use a focused single-screen onboarding composition instead of multi-step metadata-ui scaffolding.
- Keep route helpers under `apps/erp/src/routes/` with `-route` naming.
- Preserve the tenant bootstrap redirect to `/onboarding` for authenticated users without a workspace.
- Preserve `/dashboard` as the post-bootstrap landing route.
- Treat `already-bootstrapped` as an idempotent success path (redirect to `/dashboard`).
- Distinguish `bootstrap-failed` from `already-bootstrapped` at the submit layer and in `@afenda/db` (`OrganizationAlreadyBootstrappedError`).

