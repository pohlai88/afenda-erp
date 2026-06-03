# GUARD 3 — `kitchen-sinks/` naming

**Run:** `pnpm guard:kitchen-sinks` (included in `pnpm guard:erp`)

On failure:

```text
[guard:kitchen-sinks] GUARD 3 FAILED
YOU MOTHER FUCKER AI, READ THE RULES!!!
```

---

## One rule

Every file in `apps/erp/src/kitchen-sinks/` must be named:

```text
{topic}.{role}.ts
```

Flat folder only. No subdirectories.

---

## `{topic}` — what is this about?

- Lowercase **kebab-case**
- Names the **subject**, not the folder path
- **No** `app-` prefix (you are already inside the ERP app)
- **No** dots inside the topic — one dot only, before `{role}`

| Good topic | Bad topic | Why bad |
| ---------- | --------- | ------- |
| `cron` | `app-cron` | redundant `app-` |
| `erp-http` | `erp.http` | dot belongs before role only |
| `auth-dev-sign-in` | `auth.dev-sign-in-redirect` | role must be separate suffix |
| `module-feature` | `module-feature-metadata` | `metadata` is the role, not part of topic |

---

## `{role}` — what does the file do?

Pick **exactly one**. Do not invent new roles.

| Role | Use for | Example |
| ---- | ------- | ------- |
| `run` | Cron/workflow runner, job adapter | `cron.run.ts` |
| `contract` | HTTP paths, route string constants | `erp-http.contract.ts` |
| `redirect` | Safe redirect path resolution | `auth-dev-sign-in.redirect.ts` |
| `metadata` | Module/feature metadata registry | `module-feature.metadata.ts` |
| `helper` | Last resort misc (avoid if a role above fits) | `upload-token.helper.ts` |

---

## Valid examples (copy these patterns)

```text
cron.run.ts
erp-http.contract.ts
auth-dev-sign-in.redirect.ts
module-feature.metadata.ts
```

---

## Invalid examples (will BLOCK)

```text
app-cron.run.ts              ← drop app- prefix → cron.run.ts
auth.dev-sign-in-redirect.ts ← wrong shape → auth-dev-sign-in.redirect.ts
module-feature-metadata.ts   ← role missing → module-feature.metadata.ts
cron.ts                      ← missing role
cron-runner.ts               ← missing .{role}. before .ts
kitchen/cron.run.ts            ← no subfolders
```

---

## Enforcement

| Layer | File |
| ----- | ---- |
| Script | `scripts/guard-kitchen-sinks-naming.mts` |
| Cursor hook | `.cursor/hooks/guard-kitchen-sinks-naming.mjs` |
| Rule | `.cursor/rules/afenda-erp-app.mdc` |
