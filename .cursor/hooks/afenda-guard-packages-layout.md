# GUARD 5 — `packages/` layout (3 modes)

**Run:** `pnpm guard:packages`

**Fail banner:** `YOUR MOTHER OR FATHER IS A WHORE, FUCK OFF AND CORRECT IT`

## Mode 1 — Single-feature

One feature → **totally flat `src/`**

```text
packages/<pkg>/src/
  index.ts | client.ts | server.ts | metadata.ts
  {code}-{topic}.{artifact}.{canonical}.ts
```

Examples: `packages/ai`, `packages/features/lynx`

`"afenda": { "layout": "single-feature" }`

---

## Mode 2 — Multi-feature (2 layers)

Multiple features → **`src/features/<slice>/` flat**

```text
packages/<pkg>/src/
  doors
  features/
    users/          ← flat
    lynx/           ← flat
```

Example: `packages/features/system-admin`

`"afenda": { "layout": "multi-feature" }`

---

## Mode 3 — Tiered-feature (3 layers) — HR Suite

**Feature → sub-feature → flatten**

```text
packages/features/hr-suite/src/
  index.ts | client.ts | server.ts | metadata.ts     ← package doors
  employee-management/                              ← layer 1 FEATURE
    compliance-regulatory-tracking/                   ← layer 2 SUB-FEATURE
      hr.workforce.compliance.actions.server.ts       ← layer 3 FLAT
      server.ts | client.ts | metadata.ts             ← slice doors OK
  talent-management/
    recruitment-onboarding/
      hr.* flat files
  hr-suite-integration/                               ← flat at layer 1 (no layer 2)
    server.ts | client.ts | metadata.ts
    hrs-* or integration flat files
```

**NO** `src/features/` container for tiered packages.  
**NO** bucket folders at layer 3 (`actions/`, `data/`, `surface/`, …).

`"afenda": { "layout": "tiered-feature", "tiered": { "featureDomains": [...], "flatAtFeatureRoot": ["hr-suite-integration"] } }`

---

## Mode 4 — metadata-ui-runtime (GUARD 6)

Structured runtime package — **not** GUARD 5 flat layout.

```text
packages/metadata-ui/src/
  index.ts | client.ts | server.ts
  contracts/ | schemas/ | registry/ | runtime/ | identity/
  security/ | server-actions/ | shell/ | renderers/ | presentation/ | logging/ | tests/
  sections/<kind>/   ← flat per section kind (list, stat, chart, …)
```

Naming: `{purpose}.{runtime}.ts(x)` — e.g. `list-table.client.tsx`, `list.schema.ts`.  
**Never** `gov-*`, `governed-*`, `*-surface-*`, `*-helper-*`, `*-utils-*` noise.

`"afenda": { "layout": "metadata-ui-runtime" }`  
**Run:** `pnpm guard:metadata-ui` · **Law:** `packages/metadata-ui/architecture.md`

---

## Scan

Every package with `src/` is scanned. Log shows mode:

```text
packages/features/hr-suite [tiered-feature]
packages/features/system-admin [multi-feature]
packages/ai [single-feature]
```

Hook: `.cursor/hooks/guard-packages-layout.mjs`
