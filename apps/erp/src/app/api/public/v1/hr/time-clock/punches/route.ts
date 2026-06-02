import { ingestHrTimeClockPunchesApiHandler } from "@afenda/feature-hr-suite/server";

export async function POST(request: Request): Promise<Response> {
  const result = await ingestHrTimeClockPunchesApiHandler({
    authorizationHeader: request.headers.get("authorization"),
    organizationIdHeader: request.headers.get("x-afenda-organization-id"),
    externalDeviceIdHeader: request.headers.get("x-afenda-device-id"),
    body: await request.json().catch(() => null),
  });
  const authError = !result.ok &&
    typeof result.error === "string" &&
    result.error.startsWith("hr_time_clock_api_auth_");
  return Response.json(result, { status: result.ok ? 200 : authError ? 401 : 400 });
}
