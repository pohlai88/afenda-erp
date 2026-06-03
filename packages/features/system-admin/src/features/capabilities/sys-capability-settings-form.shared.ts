import { readOptionalFormValue } from "../../tenant-execution/contracts/system-admin.execution-settings.shared";
import { systemAdminCapabilitySettingsActionSchema } from "../schemas/system-admin.capability-settings.schema";

export function parseSystemAdminCapabilitySettingsFormData(formData: FormData) {
  return systemAdminCapabilitySettingsActionSchema.safeParse({
    capabilityKey: readOptionalFormValue(formData.get("capabilityKey")),
    availability: readOptionalFormValue(formData.get("availability")),
  });
}
