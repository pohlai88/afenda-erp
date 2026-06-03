import "server-only";

import { getNeonAuthEnv } from "@afenda/config/env";
import crypto from "node:crypto";
import { getNeonAuthJwkByKid } from "./jwks.shared.server";

const MAX_WEBHOOK_AGE_MS = 5 * 60 * 1000;
const MAX_WEBHOOK_FUTURE_SKEW_MS = 60 * 1000;

function readHeader(headers: Headers, name: string): string {
  const value = headers.get(name);
  if (!value) throw new Error(`Missing ${name} header.`);
  return value;
}

/** @see https://neon.com/docs/auth/guides/webhooks#signature-verification */
export async function verifyNeonAuthWebhookPayload(input: {
  rawBody: string;
  headers: Headers;
}): Promise<unknown> {
  const baseUrl = getNeonAuthEnv().NEON_AUTH_BASE_URL;
  if (!baseUrl) throw new Error("Neon Auth is not configured.");

  const signature = readHeader(input.headers, "x-neon-signature");
  const kid = readHeader(input.headers, "x-neon-signature-kid");
  const timestamp = readHeader(input.headers, "x-neon-timestamp");

  const ageMs = Date.now() - Number.parseInt(timestamp, 10);
  if (!Number.isFinite(ageMs) || ageMs > MAX_WEBHOOK_AGE_MS) {
    throw new Error("Webhook timestamp is too old.");
  }
  if (ageMs < -MAX_WEBHOOK_FUTURE_SKEW_MS) {
    throw new Error("Webhook timestamp is in the future.");
  }

  const jwk = await getNeonAuthJwkByKid(kid);
  const publicKey = crypto.createPublicKey({ key: jwk, format: "jwk" });

  const parts = signature.split(".");
  if (parts.length !== 3) throw new Error("Expected detached JWS format.");
  const [headerB64, emptyPayload, signatureB64] = parts;
  if (emptyPayload !== "" || !headerB64 || !signatureB64) {
    throw new Error("Expected detached JWS format.");
  }

  const payloadB64 = Buffer.from(input.rawBody, "utf8").toString("base64url");
  const signingInput = `${headerB64}.${Buffer.from(`${timestamp}.${payloadB64}`, "utf8").toString("base64url")}`;
  const isValid = crypto.verify(null, Buffer.from(signingInput), publicKey, Buffer.from(signatureB64, "base64url"));
  if (!isValid) throw new Error("Invalid webhook signature.");
  return JSON.parse(input.rawBody) as unknown;
}
