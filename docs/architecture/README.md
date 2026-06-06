# Architecture

**6 documents — complete.**

```txt
ARCH-1001 – ARCH-1006 (6 books)
```

Full rules: [ARCH-1001](1001-afenda-platform-doctrine.md).

---

## Library

| ID | File | Layer |
| -- | ---- | ----- |
| **ARCH-1001** | [1001-afenda-platform-doctrine.md](1001-afenda-platform-doctrine.md) | Constitution |
| **ARCH-1002** | [1002-backend.md](1002-backend.md) | Backend |
| **ARCH-1003** | [1003-frontend.md](1003-frontend.md) | Frontend |
| **ARCH-1004** | [1004-api.md](1004-api.md) | API |
| **ARCH-1005** | [1005-infrastructure.md](1005-infrastructure.md) | Infrastructure |
| **ARCH-1006** | [1006-control-plane.md](1006-control-plane.md) | Control plane |

---

## The system (plain)

```txt
One Next.js app · One Neon Postgres · pnpm monorepo

  Frontend     apps/erp, appshell, governed-surface
  Backend      packages/features/*, kernel, db
  API          app/api/{public,internal}/v1, @afenda/api, feature */api (see ARCH-1004)
  Control plane  /system-admin → @afenda/feature-system-admin
```

Guards: `pnpm architecture:check`. Roadmaps: [`docs/roadmap/`](../roadmap/).

## Supplemental notes

| Topic | File |
| -- | ---- |
| Tenant onboarding decision | [tenant-onboarding.md](tenant-onboarding.md) |

**Platform supplements** (linked from parent books, not numbered ARCH-100x):

| ID | File | Layer |
| -- | ---- | ----- |
| **ARCH-OS-1001** | [object-storage evidence](../../packages/object-storage/docs/arch-os-1001-object-storage-evidence-architecture.md) | `@afenda/object-storage` |

**Vercel platform** (Fluid Compute, Remote Cache, AI Gateway, Blob, BotID, Firewall, Runtime Cache): **1003** §8–§9, §13 · **1004** §5–§6 · **1005** §2–§4, §9–§10.
