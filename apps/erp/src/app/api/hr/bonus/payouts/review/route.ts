import { reviewBonusPayoutJsonAction } from "@afenda/feature-hr-suite/server";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<Record<string, never>>;
};

/** BON-023 — JSON route for payout approve / reject / return / adjust. */
export async function POST(
  request: Request,
  _context: RouteContext,
): Promise<NextResponse> {
  const body: unknown = await request.json().catch(() => null);
  const result = await reviewBonusPayoutJsonAction(body);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
