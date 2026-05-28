import {
  authenticateApiCredential,
  type ApiCredentialAuthenticationResult,
} from "@afenda/db";
import { isSystemAdminApiScope, type SystemAdminApiScope } from "../contracts";

function parseBearerToken(authorizationHeader: string | null | undefined) {
  if (!authorizationHeader) {
    return null;
  }

  const match = /^Bearer\s+(.+)$/i.exec(authorizationHeader.trim());
  return match?.[1]?.trim() || null;
}

export async function authenticateSystemAdminApiCredential(input: {
  authorizationHeader: string | null | undefined;
  requiredScope?: SystemAdminApiScope;
}): Promise<ApiCredentialAuthenticationResult> {
  if (input.requiredScope && !isSystemAdminApiScope(input.requiredScope)) {
    return { ok: false, reason: "invalid" };
  }

  const rawKey = parseBearerToken(input.authorizationHeader);
  if (!rawKey) {
    return { ok: false, reason: "invalid" };
  }

  return authenticateApiCredential({
    rawKey,
    requiredScope: input.requiredScope,
  });
}
