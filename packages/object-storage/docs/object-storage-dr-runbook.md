# Object storage disaster recovery runbook

Operator runbook for Cloudflare R2 (primary) and Vercel Blob (legacy) tenant object storage.

## Recovery objectives

| Objective | Target | Notes |
| --------- | ------ | ----- |
| **RPO** (Recovery Point Objective) | ≤ 24 hours | R2 has no continuous cross-region replica in Afenda today; recovery depends on last successful object copy or provider snapshot. |
| **RTO** (Recovery Time Objective) | ≤ 4 hours | Includes credential validation, CORS re-provision, and sample tenant download verification. |

## Preconditions

- Repo root with synced secrets: `pnpm env:sync:all`
- Cloudflare account access (R2 bucket + API token)
- Vercel project access when validating Blob fallback

## Drill steps (quarterly)

1. **Confirm provider** — `OBJECT_STORAGE_PROVIDER` matches production intent (`r2` or `vercel-blob`).
2. **Credential smoke test** — from repo root:
   ```bash
   pnpm r2:verify
   pnpm r2:verify:presign
   ```
   Expect exit code 0 and `HeadBucket` success for R2.
3. **Bucket reachability** — `pnpm r2:status` (custom domain, CORS rules, managed domain state).
4. **CORS alignment** — `pnpm r2:provision` when `NEXT_PUBLIC_SITE_URL` or origins changed.
5. **Sample object round-trip** — upload a test file via ERP upload flow; download via `/api/internal/v1/documents/[documentId]/download`.
6. **Registry consistency** — confirm `erp_documents.pathname` resolves to an existing object key (`tenants/{organizationId}/{moduleId}/…`).
7. **Audit trail** — verify `DOCUMENT_UPLOADED` / `DOCUMENT_DOWNLOADED` events appear in System Admin audit viewer for the drill document.
8. **Record evidence** — log drill date, operator, command output, and any remediation in change management.

## Failure scenarios

| Scenario | Detection | Response |
| -------- | --------- | -------- |
| R2 credentials revoked | `pnpm r2:verify` fails | Rotate `OBJECT_STORAGE_*` keys; redeploy; re-run verify |
| CORS misconfiguration | Browser PUT fails on presign upload | Run `pnpm r2:provision`; confirm origins include ERP site URL |
| Object missing but DB row exists | Download 404 / signed URL error | Restore object from backup copy; preserve pathname |
| Provider cutover (Blob → R2) | Mixed hostnames in `blob_url` | Custom copy per `AGENTS.md` migration section; cutover flag |

## Escalation

- Platform: object-storage package maintainers
- Cloudflare: R2 dashboard + API token scope
- Vercel: Blob token rotation via project settings

## Related

- Architecture: [`arch-os-1001-object-storage-evidence-architecture.md`](./arch-os-1001-object-storage-evidence-architecture.md)
- Reliability surface: System Admin → Reliability (`pnpm r2:verify` operational link)
