import { ingestHrTimeClockPunchesApiHandler } from "@afenda/feature-hr-suite/server";
import { NextResponse } from "next/server";

/** HRM-TCI-010 — API punch ingestion (org API key or device credential). */
export async function POST(request: Request): Promise<NextResponse> {
  const body: unknown = await request.json().catch(() => null);
  const result = await ingestHrTimeClockPunchesApiHandler({
    authorizationHeader: request.headers.get("authorization"),
    organizationIdHeader: request.headers.get("x-afenda-organization-id"),
    externalDeviceIdHeader: request.headers.get("x-afenda-device-id"),
    body,
  });

  if (!result.ok) {
    const status =
      typeof result.error === "string" &&
      result.error.startsWith("hr_time_clock_api_auth_")
        ? 401
        : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
