import { NextResponse } from "next/server";

import { submitOnboardingBootstrap } from "@/routes/onboarding-bootstrap.server";

function redirectToOnboarding(request: Request, searchParams: URLSearchParams) {
  const url = new URL("/onboarding", request.url);
  url.search = searchParams.toString();
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await submitOnboardingBootstrap(formData.get("organizationName"));

  if (result.ok || result.code === "already-bootstrapped") {
    return NextResponse.redirect(new URL("/dashboard", request.url), 303);
  }

  if (result.code === "unauthenticated") {
    return NextResponse.redirect(new URL("/sign-in", request.url), 303);
  }

  const searchParams = new URLSearchParams();

  if (result.code === "invalid-organization-name") {
    searchParams.set("error", "organization-name");

    if (result.organizationName) {
      searchParams.set("organizationName", result.organizationName);
    }

    return redirectToOnboarding(request, searchParams);
  }

  searchParams.set("error", "bootstrap-failed");

  if (result.organizationName) {
    searchParams.set("organizationName", result.organizationName);
  }

  return redirectToOnboarding(request, searchParams);
}
