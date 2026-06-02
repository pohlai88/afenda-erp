"use server";

import {
  AFENDA_SESSION_COOKIE,
  DEMO_ORG_ID,
  DEMO_USER_ID,
  DEV_SESSION_MAX_AGE_SECONDS,
  appCapabilities,
  devSignInSchema,
  normalizeOrganizationSlug,
  type UserSession,
} from "@afenda/auth";
import {
  bootstrapDevSessionTenant,
  createDevSessionCookie,
  signOut,
} from "@afenda/auth/server";
import { isDevCookieAuthEnabled } from "@afenda/config/env";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { resolveDevSignInRedirectPath } from "./dev-sign-in-redirect";

function createSession(formData: FormData): UserSession {
  const parsed = devSignInSchema.parse({
    name: String(formData.get("name") || "Demo Operator"),
    email: String(formData.get("email") || "owner@afenda.local"),
    organizationName: String(
      formData.get("organizationName") || "Afenda Operations",
    ),
  });

  return {
    source: "dev",
    id: DEMO_USER_ID,
    name: parsed.name,
    email: parsed.email,
    activeOrganizationId: DEMO_ORG_ID,
    organizations: [
      {
        id: DEMO_ORG_ID,
        membershipId: "member_demo_owner",
        name: parsed.organizationName,
        slug: normalizeOrganizationSlug(parsed.organizationName),
        locale: "en-MY",
        role: "owner",
        capabilities: [...appCapabilities],
      },
    ],
  };
}

export async function signInAction(formData: FormData) {
  if (!isDevCookieAuthEnabled()) {
    redirect("/sign-in");
  }

  const session = createSession(formData);
  await bootstrapDevSessionTenant(session);

  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const redirectTo = resolveDevSignInRedirectPath({
    formValue: formData.get("redirectTo"),
    origin: requestHeaders.get("origin"),
    referer: requestHeaders.get("referer"),
  });

  cookieStore.set(AFENDA_SESSION_COOKIE, createDevSessionCookie(session), {
    httpOnly: true,
    sameSite: "lax",
    secure:
      process.env.NODE_ENV === "production" &&
      process.env.AFENDA_E2E_DEV_AUTH !== "1",
    path: "/",
    maxAge: DEV_SESSION_MAX_AGE_SECONDS,
  });

  redirect(redirectTo);
}

export async function signOutAction() {
  await signOut();
  redirect("/sign-in");
}
