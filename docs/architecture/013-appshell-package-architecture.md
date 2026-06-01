# ARCH-013 · AppShell Package Architecture

**Doc ID:** `ARCH-013` · **File:** `013-appshell-package-architecture.md`

| Field      | Value                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------- |
| Status     | Active — first-class AppShell package scaffold                                                     |
| Authority  | Authenticated ERP AppShell chrome, DTO contracts, desktop/tablet AppShell geometry, interaction UI |
| Defers to  | **ARCH-001** for runtime/deploy · **ARCH-002** for feature package boundaries                      |
| Related    | **ARCH-003** package registry · **ARCH-008** workspace package discipline · **ARCH-009** Lynx brand |

`@afenda/appshell` is the authenticated ERP AppShell chrome owner. It is a
runtime package consumed by `apps/erp`; it is not a deployable app, feature
package, or primitive UI library.

This first pass scaffolds architecture and package boundaries only. Runtime
adoption into `(workspace)/layout.tsx` happens in a later explicit change.

## Ownership

`@afenda/appshell` owns:

- L1 utility bar.
- Primary rail.
- Command center.
- AppShell overlays.
- AppShell DTO schemas.
- AppShell geometry.
- AppShell client interaction state.

`apps/erp` still owns App Router route files, session and organization
resolution, capability checks at page entry, page composition, and mounting the
AppShell with serialized chrome.

`@afenda/ui` remains primitive-only. Feature packages expose AppShell adapter
metadata through public package doors; AppShell and app code must not deep-import
feature implementation files.

## Public Doors

| Export                    | Use                                                                 |
| ------------------------- | ------------------------------------------------------------------- |
| `@afenda/appshell`        | Server-safe contracts and RSC bridge components                     |
| `@afenda/appshell/client` | Client AppShell components and hooks                                |
| `@afenda/appshell/server` | Server validation and composition helpers for serialized chrome DTOs |

The root export must stay safe for Server Components. Client-only behavior lives
behind `./client`; server-only composition helpers live behind `./server`.

## Server-First Flow

1. `apps/erp` resolves session, organization, and capabilities on the server.
2. App or feature adapters build serializable AppShell metadata through public
   doors.
3. `@afenda/appshell/server` validates and composes the `AppShellChrome` DTO.
4. `@afenda/appshell` renders the chrome and passes browser interaction to
   `@afenda/appshell/client`.
5. Client code may manage collapsed state, command center state, overlay state,
   keyboard shortcuts, and local filtering. It must not become an authority
   source for tenant, permission, or command availability.

## DTO Rules

AppShell DTOs are serialized presentation contracts, not authority objects.

DTOs must not contain:

- callbacks or executable functions;
- database rows;
- raw organization authority received from clients;
- raw permission authority;
- persisted command labels or hrefs that bypass server recomposition.

Canonical DTOs:

- `AppShellChrome`
- `AppShellUtilityBarModel`
- `AppShellPrimaryRailModel`
- `AppShellCommandModel`
- `AppShellContextStackEntry`
- `AppShellActionQueueItem`

## Design Rules

This package is desktop/tablet first. Mobile AppShell is a separate view and is
not mixed into this pass.

The Codex-clean pattern for Afenda ERP:

- 3rem L1 utility bar.
- Centered command trigger.
- Compact primary rail.
- Single rail/main hairline.
- Curved main top-left corner.
- No decorative page cards or landing chrome.

Feature and route content should render inside the main workspace area. The
AppShell package owns chrome; page modules own their business surfaces.

## Package Registration

`@afenda/appshell` is registered as a runtime package under:

- `packages/appshell`
- `apps/erp/package.json`
- `packages/config/src/next.ts` `afendaTranspilePackages`
- `scripts/check-directory-architecture.mts`

It compiles to `dist/**` and follows the same single-root Vercel deployment
contract as other workspace libraries. Vercel remains one project from the repo
root using `pnpm turbo build --filter=@afenda/erp`.

## Verification

Run the package and architecture checks before adoption:

```bash
pnpm --filter @afenda/appshell typecheck
pnpm --filter @afenda/appshell test
pnpm --filter @afenda/erp typecheck
pnpm architecture:check
pnpm build
```

No e2e test is required until `@afenda/appshell` is mounted into
`apps/erp/src/app/(workspace)/layout.tsx`.
