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
import { createDevSessionCookie, signOut } from "@afenda/auth/server";
import { isDevCookieAuthEnabled } from "@afenda/config/env";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
        name: parsed.organizationName,
        slug: normalizeOrganizationSlug(parsed.organizationName),
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
  const cookieStore = await cookies();

  cookieStore.set(AFENDA_SESSION_COOKIE, createDevSessionCookie(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEV_SESSION_MAX_AGE_SECONDS,
  });

  redirect("/dashboard");
}

export async function signOutAction() {
  await signOut();
  redirect("/sign-in");
}
