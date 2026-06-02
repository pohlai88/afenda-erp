import "server-only";

import type { VaultEnv } from "@afenda/config/env";
import type {
  KeyManagementPort,
  WrappedDataKey,
} from "../../contracts/key-management.port.shared";

function toBase64(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64");
}

function fromBase64(value: string) {
  return new Uint8Array(Buffer.from(value, "base64"));
}

function resolveTransitKeyName(input: {
  organizationId: string;
  kmsKeyRef?: string | null;
  keyPrefix: string;
}) {
  if (input.kmsKeyRef?.trim()) {
    return input.kmsKeyRef.trim();
  }

  return `${input.keyPrefix}${input.organizationId}`;
}

async function vaultRequest<T>(
  env: VaultEnv,
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${env.addr.replace(/\/$/, "")}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Vault-Token": env.token,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Vault request failed (${response.status}): ${await response.text()}`);
  }

  return (await response.json()) as T;
}

export function createVaultTransitKeyManagement(input: {
  env: VaultEnv;
  organizationId: string;
  kmsKeyRef?: string | null;
}): KeyManagementPort {
  const mount = input.env.transitMount;
  const keyName = resolveTransitKeyName({
    organizationId: input.organizationId,
    kmsKeyRef: input.kmsKeyRef,
    keyPrefix: input.env.transitKeyPrefix,
  });

  return {
    async generateDataKey(): Promise<{
      plaintext: Uint8Array;
      wrapped: WrappedDataKey;
    }> {
      const payload = await vaultRequest<{
        data: { ciphertext: string; plaintext: string };
      }>(input.env, `/v1/${mount}/datakey/plaintext/${keyName}`, {
        bits: 256,
      });

      return {
        plaintext: fromBase64(payload.data.plaintext),
        wrapped: {
          ciphertext: fromBase64(payload.data.ciphertext),
          keyId: keyName,
        },
      };
    },

    async decryptDataKey(decryptInput: {
      wrapped: WrappedDataKey;
    }): Promise<Uint8Array> {
      const payload = await vaultRequest<{ data: { plaintext: string } }>(
        input.env,
        `/v1/${mount}/decrypt/${keyName}`,
        {
          ciphertext: toBase64(decryptInput.wrapped.ciphertext),
        },
      );

      return fromBase64(payload.data.plaintext);
    },
  };
}
