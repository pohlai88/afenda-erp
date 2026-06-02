import { requireCapability } from "@afenda/auth/server";
import { loadKnowledgeAdminPageModel } from "@afenda/feature-knowledge/server";
import { cache } from "react";

/** Request-scoped knowledge admin bundle — ARCH-1003 in-process read model. */
export const loadKnowledgeAdminBundle = cache(async () => {
  const { organization } = await requireCapability("system-admin.view");

  const pageModel = await loadKnowledgeAdminPageModel({
    organizationId: organization.id,
  });

  return {
    organization,
    ...pageModel,
  };
});
