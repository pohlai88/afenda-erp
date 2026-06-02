import { reviewBonusPayoutJsonAction } from "@afenda/feature-hr-suite/server";

export async function POST(request: Request): Promise<Response> {
  const result = await reviewBonusPayoutJsonAction(
    await request.json().catch(() => null),
  );
  return Response.json(result, { status: result.ok ? 200 : 400 });
}
