import "server-only";

import {
  DecryptCommand,
  GenerateDataKeyCommand,
  KMSClient,
} from "@aws-sdk/client-kms";
import type { AwsKmsEnv } from "@afenda/config/env";
import type {
  KeyManagementPort,
  WrappedDataKey,
} from "../../contracts/key-management.port.shared";

function resolveKmsKeyId(input: {
  organizationId: string;
  kmsKeyRef?: string | null;
}) {
  const keyRef = input.kmsKeyRef?.trim();

  if (!keyRef) {
    throw new Error("AWS KMS CMK ARN is required for customer-managed encryption.");
  }

  return keyRef;
}

function resolveKmsRegion(keyId: string, env: AwsKmsEnv) {
  const arnMatch = /^arn:aws:kms:([^:]+):/.exec(keyId);
  return arnMatch?.[1] ?? env.region;
}

export function createAwsKmsKeyManagement(input: {
  env: AwsKmsEnv;
  organizationId: string;
  kmsKeyRef?: string | null;
}): KeyManagementPort {
  const keyId = resolveKmsKeyId(input);
  const region = resolveKmsRegion(keyId, input.env);
  const client = new KMSClient({ region });

  return {
    async generateDataKey(): Promise<{
      plaintext: Uint8Array;
      wrapped: WrappedDataKey;
    }> {
      const response = await client.send(
        new GenerateDataKeyCommand({
          KeyId: keyId,
          KeySpec: "AES_256",
        }),
      );

      if (!response.Plaintext || !response.CiphertextBlob) {
        throw new Error("AWS KMS GenerateDataKey returned incomplete payload.");
      }

      return {
        plaintext: new Uint8Array(response.Plaintext),
        wrapped: {
          ciphertext: new Uint8Array(response.CiphertextBlob),
          keyId,
          keyVersion: response.KeyId,
        },
      };
    },

    async decryptDataKey(decryptInput: {
      wrapped: WrappedDataKey;
    }): Promise<Uint8Array> {
      const response = await client.send(
        new DecryptCommand({
          CiphertextBlob: decryptInput.wrapped.ciphertext,
          KeyId: decryptInput.wrapped.keyId,
        }),
      );

      if (!response.Plaintext) {
        throw new Error("AWS KMS Decrypt returned no plaintext.");
      }

      return new Uint8Array(response.Plaintext);
    },
  };
}
