# neon-auth directory tree (review scaffold)

Generated for plan review. Run `scaffold-placeholders.ps1` from this folder to materialize placeholder files for git.

```
packages/auth/neon-auth/
├── README.md
├── TREE.md
├── scaffold-placeholders.ps1
├── server.ts
├── client.ts
├── index.ts
├── runtime/
│   ├── neon-auth.server.ts
│   ├── neon-auth.client.ts
│   ├── neon-session.server.ts
│   └── neon-cookies.shared.ts
├── security/
│   ├── jwt-verify.server.ts
│   └── webhook-verify.server.ts
├── contracts/
│   ├── flows.catalog.ts
│   ├── server-sdk.catalog.ts
│   ├── env.contract.ts
│   ├── errors.catalog.ts
│   └── index.ts
├── plugins/
│   ├── email-password/
│   │   ├── catalog.ts
│   │   └── client.ts
│   ├── email-otp/
│   │   ├── catalog.ts
│   │   └── client.ts
│   ├── magic-link/
│   │   ├── catalog.ts
│   │   └── client.ts
│   ├── oauth/
│   │   ├── catalog.ts
│   │   └── client.ts
│   ├── recovery/
│   │   ├── catalog.ts
│   │   └── client.ts
│   ├── account/
│   │   ├── catalog.ts
│   │   └── client.ts
│   ├── jwt/
│   │   └── catalog.ts
│   ├── admin/
│   │   └── catalog.ts
│   ├── organization/
│   │   └── catalog.ts
│   └── phone-number/
│       └── catalog.ts
├── webhooks/
│   ├── contract.ts
│   ├── policy.server.ts
│   ├── handler.server.ts
│   └── hooks.server.ts
└── tests/
    ├── runtime/
    │   └── neon-session.test.ts
    ├── security/
    │   └── webhook-verify.test.ts
    ├── plugins/
    │   └── recovery-client.test.ts
    └── webhooks/
        └── policy.test.ts
```

## Placeholder convention

Each `.ts` file starts with:

```typescript
/** @placeholder Scaffold — migrate in Phase 2. See README.md */
export {};
```

Tests use:

```typescript
/** @placeholder Test scaffold — migrate from packages/auth/tests/unit/ */
export {};
```

## Migration map (legacy → target)

| Legacy | Target |
| ------ | ------ |
| `src/neon/auth.neon-auth-server.ts` | `runtime/neon-auth.server.ts` |
| `src/neon/auth.neon-auth-client.ts` | `runtime/neon-auth.client.ts` |
| `src/neon/auth.neon-session.ts` | `runtime/neon-session.server.ts` |
| `src/neon/auth.neon-cookies.ts` | `runtime/neon-cookies.shared.ts` |
| `src/neon/auth.neon-jwt-verify.server.ts` | `security/jwt-verify.server.ts` |
| `src/neon/auth.neon-webhook-verify.server.ts` | `security/webhook-verify.server.ts` |
| `src/neon/auth.neon-webhook-handler.server.ts` | `webhooks/handler.server.ts` |
| `src/neon/auth.neon-webhook-policy.server.ts` | `webhooks/policy.server.ts` |
| `src/contracts/auth.neon-email-otp.ts` | `plugins/email-otp/catalog.ts` |
| `src/contracts/auth.neon-magic-link.ts` | `plugins/magic-link/catalog.ts` |
| `src/contracts/auth.neon-admin.ts` | `plugins/admin/catalog.ts` |
| `src/contracts/auth.neon-organization.ts` | `plugins/organization/catalog.ts` |
| `src/contracts/auth.neon-phone-number.ts` | `plugins/phone-number/catalog.ts` |
| `src/contracts/auth.neon-jwt.ts` | `plugins/jwt/catalog.ts` |
| `src/contracts/auth.neon-server-sdk.ts` | `contracts/server-sdk.catalog.ts` |
| `src/contracts/auth.neon-webhook.ts` | `webhooks/contract.ts` |
| `src/contracts/auth.flows.ts` (Neon parts) | `contracts/flows.catalog.ts` |
| `src/recovery/auth-recovery-adapter.client.ts` | `plugins/recovery/client.ts` |
