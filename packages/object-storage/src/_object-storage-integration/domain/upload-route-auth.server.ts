import "server-only";

import {
  hasDocumentReadAccess,
  hasDocumentWriteAccess,
} from "@afenda/auth";
import { getErpModuleById, uploadRouteCopy, type ModuleId } from "@afenda/kernel";
import { getOrganizationContext } from "@afenda/kernel/server";
import { UploadRouteError } from "../domain/upload-route.error.shared";

export async function requireUploadModuleAccess(
  moduleId: ModuleId,
  intent: "upload" | "download" = "upload",
) {
  const moduleDefinition = getErpModuleById(moduleId);

  if (!moduleDefinition) {
    throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
  }

  let context;
  try {
    context = await getOrganizationContext();
  } catch {
    throw new UploadRouteError(409, uploadRouteCopy.organizationRequired);
  }

  const { organization, session } = context;
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
