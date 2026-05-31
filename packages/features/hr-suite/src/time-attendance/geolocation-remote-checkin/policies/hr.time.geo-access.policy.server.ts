import type { AppCapability } from "@afenda/auth";
import {
  resolveEmployeeIdsVisibleToActor,
} from "@afenda/db";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

export type HrGeoAccessScope = "self" | "team" | "org";

export type HrGeoExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
  canWriteGeo: boolean;
  canViewDetailedLocation: boolean;
  canReadAudit: boolean;
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleEmployeeIds(input: {
    scope: HrGeoAccessScope;
    selfEmployeeId?: string | null;
  }): Promise<readonly string[] | null>;
};

function toHrGeoExecutionGuard(context: ExecutionContext): HrGeoExecutionGuard {
  const canReadGeo = hasExecutionPermission(context, "hr.geo.read");
  const canWriteGeo = hasExecutionPermission(context, "hr.geo.write");
  const canViewDetailedLocation = hasExecutionPermission(
    context,
    "hr.geo.location.detail.read",
  );
  const canReadAudit =
    canReadGeo &&
    (canWriteGeo ||
      hasExecutionPermission(context, "hr.compliance.read") ||
      hasExecutionPermission(context, "system-admin.audit.read"));

  return {
    context,
    session: { id: context.userId },
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
      locale: context.locale,
      role: context.role,
      capabilities: context.capabilities,
    },
    canWriteGeo,
    canViewDetailedLocation,
    canReadAudit,
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
    async resolveVisibleEmployeeIds(scopeInput) {
      if (!canReadGeo) return [];
      const scope =
        scopeInput.scope === "org" && !canWriteGeo ? "team" : scopeInput.scope;
      return resolveEmployeeIdsVisibleToActor({
        organizationId: context.organizationId,
        actorAuthUserId: context.userId,
        scope,
        selfEmployeeId: scopeInput.selfEmployeeId,
      });
    },
  };
}

export async function requireHrGeoRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.geo.read");
  return toHrGeoExecutionGuard(context);
}

export async function requireHrGeoWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.geo.write");
  return toHrGeoExecutionGuard(context);
}

export async function requireHrGeoEmployeeCapture(): Promise<
  HrGeoExecutionGuard & { selfEmployeeId: string }
> {
  const guard = await requireHrGeoRead();
  const visible = await guard.resolveVisibleEmployeeIds({ scope: "self" });
  const selfEmployeeId = visible?.[0];
  if (!selfEmployeeId) {
    throw new Error("hr_geo_employee_identity_required");
  }
  return { ...guard, selfEmployeeId };
}
