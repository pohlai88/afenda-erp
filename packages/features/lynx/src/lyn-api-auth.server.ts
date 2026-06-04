import { NextResponse } from "next/server";

import type { AppCapability } from "@afenda/kernel";
import {
  getOrganizationContext,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

export type ApiAuthContext = {
  context: ExecutionContext;
  session: { id: string; source: ExecutionContext["sessionSource"] };
  organization: {
    id: string;
    name: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
};

async function toApiAuthContext(context: ExecutionContext): Promise<ApiAuthContext> {
  const organizationContext = await getOrganizationContext();
  return {
    context,
    session: { id: context.userId, source: context.sessionSource },
    organization: {
      id: context.organizationId,
      name: organizationContext.organization.name,
      slug: context.organizationSlug,
      locale: context.locale,
      role: context.role,
      capabilities: context.capabilities,
    },
  };
}

export async function getApiAuthContext(): Promise<ApiAuthContext | Response> {
  try {
    return toApiAuthContext(await requireExecutionContext());
  } catch {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
}

export async function requireCapability(
  capability: AppCapability,
): Promise<ApiAuthContext> {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, capability);
  return toApiAuthContext(context);
}
