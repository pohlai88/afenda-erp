import "server-only";

import {
  getActiveOrganization,
  getSession,
  hasDocumentReadAccess,
  hasDocumentWriteAccess,
} from "@afenda/auth/server";
import { getErpModuleById, uploadRouteCopy, type ModuleId } from "@afenda/kernel";
import { UploadRouteError } from "../domain/upload-route.error.shared";

export async function requireUploadModuleAccess(
  moduleId: ModuleId,
  intent: "upload" | "download" = "upload",
) {
  const moduleDefinition = getErpModuleById(moduleId);

  if (!moduleDefinition) {
    throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
  }

  const session = await getSession();

  if (!session) {
    throw new UploadRouteError(401, uploadRouteCopy.authenticationRequired);
  }

  const organization = getActiveOrganization(session);

  if (!organization) {
    throw new UploadRouteError(409, uploadRouteCopy.organizationRequired);
  }

  const { capabilities } = organization;

  const hasModuleAccess = capabilities.includes(
    moduleDefinition.requiredCapability,
  );

  if (!hasModuleAccess) {
    throw new UploadRouteError(
      403,
      intent === "download"
        ? uploadRouteCopy.downloadNotAllowed
        : uploadRouteCopy.uploadNotAllowed,
    );
  }

  const hasDocumentAccess =
    intent === "download"
      ? hasDocumentReadAccess(capabilities, moduleId)
      : hasDocumentWriteAccess(capabilities, moduleId);

  if (!hasDocumentAccess) {
    throw new UploadRouteError(
      403,
      intent === "download"
        ? uploadRouteCopy.downloadNotAllowed
        : uploadRouteCopy.uploadNotAllowed,
    );
  }

  return {
    session,
    organization,
    moduleDefinition,
  };
}

/** @deprecated Use requireUploadModuleAccess */
export const requireBlobModuleAccess = requireUploadModuleAccess;
