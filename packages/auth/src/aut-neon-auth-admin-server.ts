import "server-only";

import { getNeonAuthServer } from "./aut-neon-auth-server";

type NeonAuthAdminMethod =
  | "createUser"
  | "banUser"
  | "listUserSessions"
  | "revokeUserSession"
  | "revokeUserSessions"
  | "impersonateUser"
  | "stopImpersonating";

type NeonAuthAdminResult<Data = unknown> = {
  data?: Data;
  error?: { message?: string } | Error | null;
};

export type NeonAuthAdminCreateUserInput = {
  email: string;
  name?: string;
  password?: string;
  role?: string;
};

export type NeonAuthAdminUserInput = {
  userId: string;
};

export type NeonAuthAdminBanUserInput = NeonAuthAdminUserInput & {
  banReason?: string;
  banExpiresIn?: number;
};

export type NeonAuthAdminRevokeSessionInput = {
  sessionId: string;
};

function getAdminMethod(method: NeonAuthAdminMethod) {
  const server = getNeonAuthServer() as unknown as {
    admin?: Partial<Record<NeonAuthAdminMethod, unknown>>;
  };
  const adminMethod = server.admin?.[method];

  if (typeof adminMethod !== "function") {
    throw new Error(`Neon Auth admin method ${method} is not available.`);
  }

  return adminMethod as (input?: unknown) => Promise<NeonAuthAdminResult>;
}

async function callNeonAuthAdminMethod<Data>(
  method: NeonAuthAdminMethod,
  input?: unknown,
): Promise<Data | undefined> {
  const result = await getAdminMethod(method)(input);
  const error = result?.error;

  if (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : error.message ?? `Neon Auth admin method ${method} failed.`,
    );
  }

  return result?.data as Data | undefined;
}

export async function createNeonAuthAdminUser(
  input: NeonAuthAdminCreateUserInput,
) {
  return callNeonAuthAdminMethod("createUser", input);
}

export async function banNeonAuthAdminUser(input: NeonAuthAdminBanUserInput) {
  return callNeonAuthAdminMethod("banUser", input);
}

export async function listNeonAuthAdminUserSessions(input: NeonAuthAdminUserInput) {
  return callNeonAuthAdminMethod("listUserSessions", input);
}

export async function revokeNeonAuthAdminUserSession(
  input: NeonAuthAdminRevokeSessionInput,
) {
  return callNeonAuthAdminMethod("revokeUserSession", input);
}

export async function revokeNeonAuthAdminUserSessions(input: NeonAuthAdminUserInput) {
  return callNeonAuthAdminMethod("revokeUserSessions", input);
}

export async function impersonateNeonAuthAdminUser(input: NeonAuthAdminUserInput) {
  return callNeonAuthAdminMethod("impersonateUser", input);
}

export async function stopNeonAuthAdminImpersonation() {
  return callNeonAuthAdminMethod("stopImpersonating");
}
