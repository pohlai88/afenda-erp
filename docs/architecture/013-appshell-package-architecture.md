# ARCH-013 · AppShell Package Architecture

**Doc ID:** `ARCH-013` · **File:** `013-appshell-package-architecture.md`

| Field     | Value                                                                                 |
| --------- | ------------------------------------------------------------------------------------- |
| Status    | Active — first-class authenticated workspace shell package                             |
| Authority | Shell chrome contracts, workspace navigation runtime, command-center shell boundaries |
| Defers to | **ARCH-001** for runtime/auth; **ARCH-002** for feature package boundaries            |
| Related   | **ARCH-003**, **ARCH-006**, **ARCH-007**, **ARCH-008**                                |

`@afenda/appshell` owns the authenticated ERP workspace chrome: utility bar,
primary navigation rail, command-center entry point, context strip, and shell
preference contract shape. It is a runtime package, not a deployment boundary and
not a feature package.

## Ownership

| Area                | Owner                | Rule                                                                 |
| ------------------- | -------------------- | -------------------------------------------------------------------- |
| Tenant/session      | `apps/erp` + auth    | Derive on the server; never from client shell input                  |
| Shell chrome        | `@afenda/appshell`   | Render serialized identity, nav, command, utility, and context DTOs |
| App composition     | `apps/erp`           | Build shell DTOs from server session, capabilities, and kernel facts |
| ERP metadata        | governed/feature packages | Lists/forms/actions remain governed metadata, not shell metadata |
| UI primitives       | `@afenda/ui`         | AppShell consumes primitives and tokens; it does not own primitives  |

The package exposes only public doors:

| Export                | Use                                                 |
| --------------------- | --------------------------------------------------- |
| `@afenda/appshell`    | RSC shell wrapper and shared serializable contracts |
| `@afenda/appshell/client` | Client shell runtime and browser chrome         |
| `@afenda/appshell/server` | Server-safe contract parsing and types          |
| `@afenda/appshell/styles.css` | Package-local shell CSS                    |

## Migration Boundary

The package is intentionally migrated from `afenda-vercel/packages/shell` by
concept, not by wholesale copy. Portable concepts are shell contracts, desktop
geometry, primary rail metadata, command IDs, context stack, and utility slots.

The following are deliberately excluded:

- i18n and `next-intl` navigation.
- `@afenda/platform` route envelopes, DB clients, org helpers, and preference actions.
- Preview, playground, demo, or fixture shell paths.
- Feature-private adapters and business-rule imports.

`apps/erp/src/workspace-routes/workspace-appshell.server.tsx` is the local adapter
that converts authenticated server context and kernel navigation facts into
serializable AppShell chrome.

## Runtime Rules

- AppShell receives metadata; it does not fetch tenant data.
- Navigation and commands use stable IDs and hrefs. Recents remain ID-only.
- Context nodes are display/ranking metadata only; do not persist object payloads,
  permissions, callbacks, or org snapshots in shell preferences.
- Utility items declare chrome intent and href/action affordances; domain data,
  writes, and audit remain with feature or app-owned server code.
- Desktop/tablet and mobile shell views are separate product surfaces. Default
  shell work targets desktop/tablet unless a separate mobile shell pass is asked
  for explicitly.

## Next.js Mount

`apps/erp/src/app/(workspace)/layout.tsx` mounts AppShell through a sibling
`<Suspense>` boundary. This keeps the route group URL-neutral while allowing
server session and organization resolution to stream tenant chrome after the page
fallback.

The App Router tree stays thin:

```txt
apps/erp/src/app/(workspace)/layout.tsx
  -> apps/erp/src/workspace-routes/workspace-appshell.server.tsx
       -> @afenda/appshell
```

## Verification

When AppShell contracts or wiring change, run targeted validation:

```bash
pnpm --filter @afenda/appshell typecheck
pnpm --filter @afenda/appshell test
pnpm --filter @afenda/erp typecheck
pnpm architecture:check
```
