# neon-auth directory tree

Phase 5 standalone package layout under `packages/neon-auth/`.

```
packages/neon-auth/
├── README.md
├── TREE.md
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── server.ts
│   ├── client.ts
│   ├── index.ts
│   ├── runtime/
│   ├── neon-auth.server.ts
│   ├── neon-auth.client.ts
│   ├── neon-session.server.ts
│   └── neon-cookies.shared.ts
├── security/
│   ├── jwks.shared.server.ts
│   ├── jwt-verify.server.ts
│   └── webhook-verify.server.ts
├── contracts/
│   ├── index.ts
│   ├── paths.shared.ts
│   ├── flows.catalog.ts
│   ├── server-sdk.catalog.ts
│   ├── env.contract.ts
│   └── errors.catalog.ts
├── plugins/
│   ├── email-password/
│   ├── email-otp/
│   ├── magic-link/
│   ├── oauth/
│   ├── recovery/
│   ├── account/
│   ├── jwt/
│   ├── admin/
│   ├── organization/
│   └── phone-number/
├── webhooks/
│   ├── contract.ts
│   ├── policy.server.ts
│   ├── handler.server.ts
│   └── hooks.server.ts
└── tests/
    ├── runtime/
    │   ├── neon-session.test.ts
    │   └── neon-cookies.test.ts
    ├── security/
    │   ├── jwt-verify.test.ts
    │   └── webhook-verify.test.ts
    ├── plugins/
    │   └── recovery-client.test.ts
    └── webhooks/
        ├── policy.test.ts
        ├── hooks.test.ts
        └── handler.test.ts
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
| `src/contracts/auth.neon-*.ts` | `plugins/*/catalog.ts` + `contracts/` |
| `src/recovery/auth-recovery-adapter.client.ts` | `plugins/recovery/client.ts` |

## Tests

```bash
pnpm --filter @afenda/auth test
```
