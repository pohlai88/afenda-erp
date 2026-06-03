# @afenda/object-storage

Platform package — **ARCH-1002** §6 allowlist. **No ERP module business rules.**

**Local architecture (ARCH-OS-1001):** [`docs/arch-os-1001-object-storage-evidence-architecture.md`](docs/arch-os-1001-object-storage-evidence-architecture.md) — Object Storage & Document Evidence (9.5 target): ECOs, lifecycle, classification, audit ledger split, dual provider (Blob vs R2), maturity ladder.

Category: `runtime-library` · Multi-provider tenant object storage (Vercel Blob, Cloudflare R2).

## Source layout (hard law)

`src/` allows **exactly four top-level folders** plus four export doors:

```txt
src/
  index.ts, client.ts, server.ts, metadata.ts   # four export doors (ARCH-1002 §8)
  blob/                              # vercel-blob provider vertical slice
    api/                             # upload-handler.server.ts
    domain/                          # object-store.server.ts
  r2/                                # Cloudflare R2 provider vertical slice
    api/                             # upload-handler.server.ts
    domain/                          # object-store.server.ts, presign.shared.ts
    policies/                        # cors.json (browser PUT CORS template)
  s3/                                # AWS S3 SSE-KMS provider vertical slice
    api/                             # upload-handler.server.ts
    domain/                          # object-store.server.ts
  _object-storage-integration/        # shared platform wiring (horizontal buckets)
    actions/, commands/, api/, contracts/, components/, data/, domain/,
    events/, policies/, read-models/, schemas/, tests/
    api/                             # HTTP handlers, upload registration
    components/                      # upload-tenant-document.client.ts
    contracts/                       # ports + HTTP route constants
    data/                            # tenant-document.read-port.shared.ts
    domain/                          # auth, config, factory, errors
    policies/, schemas/
```

**Forbidden at `src/` root:** any folder other than `blob/`, `r2/`, `s3/`, `_object-storage-integration/`; any file other than the four export doors; legacy `providers/`, `handlers/`, custom buckets (`auth/`, `env/`, `errors/`, `client/`).

Each slice (`blob/`, `r2/`, `_object-storage-integration/`) must contain **all** ARCH-1002 §8 template buckets. Download persistence uses an injected `GetTenantDocumentForDownload` port — **`@afenda/db` is forbidden** in object-storage `api/` handlers; apps/erp routes wire `getTenantDocument`.

Guards: `.cursor/hooks/guard-architecture-compliance.mjs` (preToolUse deny) · `.cursor/hooks/guard-object-storage-shell.mjs` (shell deny) · `.cursor/rules/afenda-object-storage.mdc` · `packages/object-storage/scripts/check-object-storage-layout.mts` (CI) · `pnpm architecture:check`.

## Export doors

| Door | Use |
| ---- | --- |
| `@afenda/object-storage` | Client-safe barrel (policies, schemas, HTTP routes) |
| `@afenda/object-storage/client` | Upload helpers (`uploadTenantDocument`, `uploadTenantObject`), policies |
| `@afenda/object-storage/server` | Upload/download handlers, auth, `createObjectStore` factory |
| `@afenda/object-storage/metadata` | Registry-safe routes, upload policy limits, provider ids — no tenant reads |

## Providers

| ID | Env | Notes |
| -- | --- | ----- |
| `vercel-blob` | `BLOB_READ_WRITE_TOKEN` | Default on Vercel; server `handleUpload` + client `upload()` |
| `r2` | `OBJECT_STORAGE_PROVIDER=r2` + S3-compatible endpoint/credentials | Presign PUT → browser PUT (`credentials: omit`) → complete |

Set `OBJECT_STORAGE_PROVIDER` explicitly when both credential sets are present.

## Cloudflare R2 bucket setup

1. **Create bucket** — Dashboard (R2 → Create bucket) or `npx wrangler r2 bucket create <bucket-name>`.
2. **API token** — Dashboard → R2 → Manage API tokens → Object Read & Write scoped to the bucket. Map to `OBJECT_STORAGE_ACCESS_KEY_ID` / `OBJECT_STORAGE_SECRET_ACCESS_KEY` in `.secret.config`, then `pnpm env:sync:all`.
3. Set `OBJECT_STORAGE_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com` and `region: auto` (enforced in provider).
4. **Browser CORS** (required for presigned PUT from the ERP origin). Wrangler expects the [R2 CORS API shape](https://developers.cloudflare.com/api/resources/r2/subresources/buckets/subresources/cors/methods/update/) — a top-level `rules` array with nested `allowed.origins|methods|headers`:

```json
{
  "rules": [
    {
      "allowed": {
        "origins": ["https://your-app.example", "http://localhost:3000"],
        "methods": ["PUT", "GET", "HEAD"],
        "headers": ["Content-Type", "Content-Length"]
      },
      "exposeHeaders": ["ETag"],
      "maxAgeSeconds": 3600
    }
  ]
}
```

Apply via `pnpm r2:provision` or `npx wrangler r2 bucket cors set <bucket> --file packages/object-storage/src/r2/policies/cors.json --force`.

5. **Public access** — R2 does not support per-object S3 ACL on PUT. Enable bucket public access + custom domain in Cloudflare, then set `OBJECT_STORAGE_PUBLIC_URL_BASE` to that domain. **`access: "private"`** (default) always uses signed GET URLs. Presign rejects `access: "public"` when `OBJECT_STORAGE_PUBLIC_URL_BASE` is unset.

6. **Verify & CORS (Cloudflare SDK + wrangler + MCP)** — from repo root after `pnpm env:sync:all`:

| Command / MCP | Purpose |
| ------------- | ------- |
| `pnpm r2:verify` | Resolve env + S3 `HeadBucket` (credentials) |
| `pnpm r2:cloudflare:verify` | `cloudflare-typescript` auth + zone list (`CLOUDFLARE_API_TOKEN`) |
| `pnpm r2:status` | Wrangler bucket info + SDK snapshot (custom/managed domains, CORS) |
| `pnpm r2:provision` | Apply CORS via SDK (preferred) or wrangler |
| `pnpm r2:domain:provision` | Attach custom domain + disable r2.dev via SDK (wrangler fallback) |
| MCP `cloudflare-bindings` → `r2_bucket_get` | Bucket metadata (location, jurisdiction) |
| MCP `cloudflare` → `execute` / `search` | Same REST paths as [cloudflare-typescript](https://github.com/cloudflare/cloudflare-typescript) |

`wrangler.jsonc` pins the Cloudflare account id. CORS template: `packages/object-storage/src/r2/policies/cors.json`; provision writes `cors.generated.json` alongside it.

Legacy env keys `R2_*` map to `OBJECT_STORAGE_*` in `@afenda/config/env`.

Managed public domain (`*.r2.dev`) is **disabled** by default — enable in Cloudflare only when using `access: "public"`.

## Presigned URLs (R2 upload/download)

Follow [Cloudflare presigned URL doctrine](https://developers.cloudflare.com/r2/api/s3/presigned-urls/):

| Requirement | Afenda implementation |
| ----------- | --------------------- |
| S3 endpoint `https://<account_id>.r2.cloudflarestorage.com` | `OBJECT_STORAGE_ENDPOINT` — presigned URLs always use this host (not custom domains) |
| `region: "auto"` | Enforced in `createR2Client` |
| PUT presign with restricted `ContentType` | `PutObjectCommand({ ContentType })` — no signed `Content-Length`; size verified on `complete` via `HeadObject` |
| `expiresIn: 3600` | `R2_PRESIGN_EXPIRES_SECONDS` in `r2/domain/presign.shared.ts` |
| Browser CORS for cross-origin PUT | `pnpm r2:provision` — origins from `NEXT_PUBLIC_SITE_URL` + localhost |
| Client PUT | `credentials: "omit"`; send only signed `Content-Type` header |
| Private download | `GetObjectCommand` presigned GET via `getSignedDownloadUrl` |

Verify end-to-end presign (server-side PUT smoke test):

```bash
pnpm r2:verify:presign
```

Cloudflare MCP checks: `execute` → `GET .../buckets/{bucket}/cors` (must allow PUT + Content-Type + expose ETag).

## Phase 5 governance (shipped)

| Surface | Location |
| ------- | -------- |
| Quarantine inbox | System Admin → Security — `loadSystemAdminDocumentQuarantineInboxWindow` (`scanStatuses: failed`, `quarantined`); trailing **Review scan** / **Approve release** |
| Structured metrics | `incrementObjectStorageMetric` in `_object-storage-integration/api/object-storage-metrics.server.ts` — logs `metric`, `metricValue: 1`, `metricType: "counter"`, `operation: metric.{name}`, optional `moduleId` / `provider` |
| DR runbook | [`docs/object-storage-dr-runbook.md`](docs/object-storage-dr-runbook.md) — quarterly drills; linked from System Admin Reliability |
| Per-org provider | Migration **0051** — `object_storage_provider` on `organizations`; upload/download/config honor org preference; System Admin → Security form (`updateOrganizationObjectStorageProviderAction`) |

## Data migration (Vercel Blob → R2)

Operator CLI (registry-driven, preserves pathnames):

```bash
pnpm env:sync:all
pnpm blob:migrate:r2 -- --organization-id <orgId> [--dry-run] [--limit 500] [--overwrite] [--set-org-provider]
```

| Flag | Purpose |
| ---- | ------- |
| `--dry-run` | Count objects that would copy; no PUT |
| `--limit` | Cap rows from `erp_documents` (default 500) |
| `--overwrite` | Re-copy when R2 object already exists |
| `--set-org-provider` | Set `organizations.object_storage_provider = r2` after successful run |

Requires `BLOB_READ_WRITE_TOKEN`, R2 credentials (`OBJECT_STORAGE_PROVIDER=r2`), and `DATABASE_URL`.

Cloudflare [data migration](https://developers.cloudflare.com/r2/data-migration/) tools for S3-origin buckets (not Vercel Blob):

| Tool | Use when | Afenda fit |
| ---- | -------- | ---------- |
| [Super Slurper](https://developers.cloudflare.com/r2/data-migration/super-slurper/) | One-time bulk copy from S3, GCS, or S3-compatible sources | **Not for Vercel Blob** |
| [Sippy](https://developers.cloudflare.com/r2/data-migration/sippy/) | Lazy copy on read from an S3-compatible source | **Not for Vercel Blob** |

**Cutover checklist** after `pnpm blob:migrate:r2`:

1. Preserve pathnames — downloads resolve via `erp_documents.pathname`.
2. Optional DB hygiene — update legacy `blob_url` columns to R2 URL pattern if needed.
3. Set org provider (form or `--set-org-provider`) and verify `pnpm r2:verify`.
4. Validate sample download via `/api/internal/v1/documents/[id]/download` per module.

## Tenant usage

Tenants do **not** get separate R2 buckets. Isolation is app-enforced:

| Layer | Mechanism |
| ----- | --------- |
| Object keys | `tenants/{organizationId}/{moduleId}/…` (server-resolved prefix) |
| Upload auth | Session org + module capability before presign |
| Private download | Signed GET via `/api/internal/v1/documents/[id]/download` |
| Public download | Requires `OBJECT_STORAGE_PUBLIC_URL_BASE` (r2.dev or custom domain) |

**Private uploads (default)** — ready when CORS includes `NEXT_PUBLIC_SITE_URL` and `pnpm r2:verify` passes.

**Public attachments** — attach a custom domain (production), not rate-limited r2.dev:

```bash
# 1. Add CLOUDFLARE_API_TOKEN to .secret.config → pnpm env:sync:all
# 2. Add nexuscanon.com to Cloudflare (zone required for custom hostname)
# 3. pnpm r2:domain:provision   # cloudflare-typescript SDK + disable r2.dev
# 4. pnpm env:sync && pnpm r2:verify
```

| Command | Purpose |
| ------- | ------- |
| `pnpm r2:domain:provision` | SDK `POST .../domains/custom` + `PUT .../domains/managed { enabled: false }` |
| Env | `CLOUDFLARE_API_TOKEN`, `R2_PUBLIC_CUSTOM_DOMAIN`, `CLOUDFLARE_ZONE_ID` (optional auto-resolve), `OBJECT_STORAGE_PUBLIC_URL_BASE` |

If apex DNS remains on Vercel, the zone must still exist in Cloudflare for R2 custom hostnames ([public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/)).

Cloudflare MCP: `execute` → enable managed domain · `GET .../domains/managed` · verify CORS origins.

| Function | Use |
| -------- | --- |
| `uploadTenantDocument()` | Upload + ERP registry via app-wired `registerUploadedTenantDocumentCommand` |
| `uploadTenantObject()` | Upload only — returns `{ pathname, blobUrl, contentType, sizeBytes, etag? }` for HR/features |

Pathnames are built from server-resolved `pathnamePrefix` (config route) — never trust client `organizationId`.

## HTTP routes (ARCH-1004)

| Route | Handler |
| ----- | ------- |
| `POST /api/internal/v1/uploads` | Upload (Vercel body or R2 presign/complete) |
| `GET /api/internal/v1/uploads/config` | Provider + tenant prefix + policy |
| `GET /api/internal/v1/documents/[documentId]/download` | Signed tenant document download (`createTenantObjectStorageDownloadDeps`) |
| `GET /api/documents/[documentId]/download` | Legacy **308** redirect to internal v1 download |
| `POST /api/internal/v1/cron/document-scan-sweep` | Scan queue sweep |
| `POST /api/internal/v1/cron/document-retention-sweep` | Retention / destruction sweep |
| `POST /api/internal/v1/webhooks/document-scan-result` | AV scan result webhook |

## Forbidden

- Feature packages importing `@vercel/blob`, `@aws-sdk/client-s3`, or provider SDKs directly
- Module-specific document business rules (stay in `@afenda/feature-*`)
