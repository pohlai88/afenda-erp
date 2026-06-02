# Object storage BYOK runbook

Operational guide for customer-managed encryption on Afenda object storage (ARCH-OS-1001 §12).

## Decision tree

| Tenant need | Afenda path | Storage |
| ----------- | ----------- | ------- |
| Default SaaS | Platform encryption | R2 / Blob provider SSE |
| BYOK on R2 (most MY/SG tenants) | Envelope + **Vault Transit** | Ciphertext in R2 |
| Enterprise supplies AWS CMK ARN | Envelope + **AWS KMS** | Ciphertext in R2 |
| Storage-native BYOK (no app crypto) | **S3 provider** + SSE-KMS | Plaintext in S3, CMK at rest |

**Not supported:** Cloudflare R2 bucket-native CMK (AWS SSE-KMS sense). Do not wait on R2 CMK for BYOK.

## Vault Transit (priority 1)

### Deployment env

| Variable | Purpose |
| -------- | ------- |
| `VAULT_ADDR` | Self-hosted or HCP Vault URL |
| `VAULT_TOKEN` | Token with Transit encrypt/decrypt |
| `VAULT_TRANSIT_MOUNT` | Default `transit` |
| `VAULT_TRANSIT_KEY_PREFIX` | Default `afenda/org-` |

Per-org key naming: `{prefix}{organizationId}` unless `object_storage_kms_key_ref` overrides.

### Org enablement

System Admin → Security → **Object storage encryption (BYOK)**:

- Mode: Customer-managed envelope
- Adapter: Vault Transit
- Key reference: optional override path

Uploads switch to **server-mediated** encryption (`uploadMode: server`). Downloads are **proxied decrypt** (no signed redirect to ciphertext).

## AWS KMS envelope (priority 2)

### Deployment env

| Variable | Purpose |
| -------- | ------- |
| `AWS_KMS_REGION` | Default `ap-southeast-1` (PDPA MY/SG) |

Org **CMK ARN** required in `object_storage_kms_key_ref` (`arn:aws:kms:…`).

Afenda app IAM must allow `kms:GenerateDataKey` and `kms:Decrypt` on tenant CMKs. Cross-account tenants grant trust on their CMK key policy.

## S3 + SSE-KMS (priority 3)

Separate **provider** (`object_storage_provider = s3`), not envelope mode alone.

| Variable | Purpose |
| -------- | ------- |
| `OBJECT_STORAGE_PROVIDER=s3` | Deployment default (optional) |
| `OBJECT_STORAGE_BUCKET` | S3 bucket |
| `OBJECT_STORAGE_ACCESS_KEY_ID` / `OBJECT_STORAGE_SECRET_ACCESS_KEY` | IAM user/role keys |
| `AWS_S3_REGION` | Default `ap-southeast-1` |

Org must set CMK ARN in `object_storage_kms_key_ref`. Presigned PUT includes `ServerSideEncryption: aws:kms`. Downloads remain signed redirect (S3 decrypts on GET).

## Key rotation

- **Vault:** optional `keyVersion` in document metadata; lazy re-wrap on access (future CLI).
- **AWS KMS:** automatic CMK rotation; existing wrapped DEKs remain valid until re-wrap.
- **Forward-only:** enabling CMK does not re-encrypt existing plaintext objects.

## Audit

Wrap/unwrap and encrypted upload/download emit metrics: `encryption_wrap_total`, `encryption_unwrap_total`, `encrypted_uploads_total`, `encrypted_downloads_total`.

Evidence events include `encryptionAdapter` and `delivery: proxied-decrypt` where applicable.

## Verification

```bash
pnpm --filter @afenda/object-storage test
pnpm db:generate && pnpm db:migrate
pnpm architecture:check
```

Manual: enable CMK org → upload → confirm R2 object is opaque → download via ERP returns original file.
