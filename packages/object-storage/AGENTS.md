# @afenda/object-storage

Platform package — **ARCH-1002** §6 allowlist. **No ERP module business rules.**

Category: `runtime-library` · Multi-provider tenant object storage (Vercel Blob, Cloudflare R2).

## Export doors

| Door | Use |
| ---- | --- |
| `@afenda/object-storage` | Client-safe barrel (policies, schemas, HTTP routes) |
| `@afenda/object-storage/client` | Upload helpers (`uploadTenantDocument`, `uploadTenantObject`), policies |
| `@afenda/object-storage/server` | Upload/download handlers, auth, `createObjectStore` factory |

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

Apply via `pnpm r2:provision` or `npx wrangler r2 bucket cors set <bucket> --file packages/object-storage/r2/cors.json --force`.

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

`wrangler.jsonc` pins the Cloudflare account id. CORS template: `packages/object-storage/r2/cors.json`; provision writes `cors.generated.json`.

Legacy env keys `R2_*` map to `OBJECT_STORAGE_*` in `@afenda/config/env`.

Managed public domain (`*.r2.dev`) is **disabled** by default — enable in Cloudflare only when using `access: "public"`.

## Presigned URLs (R2 upload/download)

Follow [Cloudflare presigned URL doctrine](https://developers.cloudflare.com/r2/api/s3/presigned-urls/):

| Requirement | Afenda implementation |
| ----------- | --------------------- |
| S3 endpoint `https://<account_id>.r2.cloudflarestorage.com` | `OBJECT_STORAGE_ENDPOINT` — presigned URLs always use this host (not custom domains) |
| `region: "auto"` | Enforced in `createR2Client` |
| PUT presign with restricted `ContentType` | `PutObjectCommand({ ContentType })` — no signed `Content-Length`; size verified on `complete` via `HeadObject` |
| `expiresIn: 3600` | `R2_PRESIGN_EXPIRES_SECONDS` in `r2-presign.shared.ts` |
| Browser CORS for cross-origin PUT | `pnpm r2:provision` — origins from `NEXT_PUBLIC_SITE_URL` + localhost |
| Client PUT | `credentials: "omit"`; send only signed `Content-Type` header |
| Private download | `GetObjectCommand` presigned GET via `getSignedDownloadUrl` |

Verify end-to-end presign (server-side PUT smoke test):

```bash
pnpm r2:verify:presign
```

Cloudflare MCP checks: `execute` → `GET .../buckets/{bucket}/cors` (must allow PUT + Content-Type + expose ETag).

## Data migration (Vercel Blob → R2)

Cloudflare [data migration](https://developers.cloudflare.com/r2/data-migration/) tools:

| Tool | Use when | Afenda fit |
| ---- | -------- | ---------- |
| [Super Slurper](https://developers.cloudflare.com/r2/data-migration/super-slurper/) | One-time bulk copy from S3, GCS, or S3-compatible sources | **Not for Vercel Blob** — dashboard: [R2 data migration](https://dash.cloudflare.com/?to=/:account/r2/slurper) |
| [Sippy](https://developers.cloudflare.com/r2/data-migration/sippy/) | Lazy copy on read from an S3-compatible source | **Not for Vercel Blob** — requires S3 source bucket behind R2 |

**Vercel Blob → R2** needs a custom copy (Vercel Blob is not S3-compatible):

1. **Preserve pathnames** — downloads resolve via `erp_documents.pathname` (signed GET from R2), not legacy `blob_url` hostnames.
2. **Copy objects** — list from Vercel Blob (`@vercel/blob` + `BLOB_READ_WRITE_TOKEN`), `PUT` to R2 at the same key (`tenants/{orgId}/{moduleId}/…`).
3. **Optional DB hygiene** — update `erp_documents.blob_url` / HR `blob_url` columns to the R2 object URL pattern after copy.
4. **Cutover** — set `OBJECT_STORAGE_PROVIDER=r2`, run `pnpm r2:provision`, verify with `pnpm r2:verify`.
5. **Validate** — sample download via `/api/internal/v1/documents/[id]/download` per org/module.

For S3-origin buckets (not Vercel), use Super Slurper with destination `axis-attachments`, path prefix `tenants/` if needed, and **Skip** overwrite when objects already exist in R2.

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
| `GET /api/internal/v1/documents/[documentId]/download` | Signed download redirect |
| `GET /api/documents/[documentId]/download` | **308 redirect** to internal route (legacy) |

## Forbidden

- Feature packages importing `@vercel/blob`, `@aws-sdk/client-s3`, or provider SDKs directly
- Module-specific document business rules (stay in `@afenda/feature-*`)
