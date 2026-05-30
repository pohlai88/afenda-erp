import {
  getUserProfile,
  resolveHrEmployeeIdsForAuthUser,
} from "@afenda/db";

export async function resolveHrFwaApproverContext(input: {
  organizationId: string;
  authUserId: string;
  canWrite: boolean;
  authUserEmail?: string | null;
}) {
  const authUserEmail =
    input.authUserEmail ??
    (await getUserProfile(input.authUserId))?.email ??
    null;

  const actorManagerEmployeeIds = await resolveHrEmployeeIdsForAuthUser({
    organizationId: input.organizationId,
    authUserId: input.authUserId,
    authUserEmail,
  });

  return {
    actorCanHrApprove: input.canWrite,
    actorCanDepartmentApprove: input.canWrite,
    actorManagerEmployeeIds,
  };
}
