import type { CoreModuleId, ModuleFeatureMetadata, ModuleId } from "@afenda/domain";
import { isCoreModuleId } from "@afenda/domain";
import * as systemAdmin from "@afenda/feature-system-admin/metadata";
import * as approvals from "@afenda/feature-approvals/metadata";
import * as crm from "@afenda/feature-crm/metadata";
import * as finance from "@afenda/feature-finance/metadata";
import * as hr from "@afenda/feature-hr/metadata";
import * as inventory from "@afenda/feature-inventory/metadata";
import * as purchasing from "@afenda/feature-purchasing/metadata";
import * as reports from "@afenda/feature-reports/metadata";
import * as sales from "@afenda/feature-sales/metadata";

const moduleFeatureMetadataById = {
  "system-admin": systemAdmin,
  approvals,
  crm,
  finance,
  hr,
  inventory,
  purchasing,
  reports,
  sales,
} satisfies Record<CoreModuleId, ModuleFeatureMetadata>;

export function getModuleFeatureMetadata(
  moduleId: CoreModuleId,
): ModuleFeatureMetadata {
  return moduleFeatureMetadataById[moduleId];
}

export function resolveModuleFeatureMetadata(
  moduleId: ModuleId,
): ModuleFeatureMetadata | null {
  return isCoreModuleId(moduleId)
    ? getModuleFeatureMetadata(moduleId)
    : null;
}
