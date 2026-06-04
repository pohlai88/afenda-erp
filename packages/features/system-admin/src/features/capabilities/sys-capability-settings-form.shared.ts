import { readOptionalFormValue } from "../tenant-execution/sys-execution-settings.shared";
import { systemAdminCapabilitySettingsActionSchema } from "./sys-capability-settings.schema";

export function parseSystemAdminCapabilitySettingsFormData(formData: FormData) {
  return systemAdminCapabilitySettingsActionSchema.safeParse({
    capabilityKey: readOptionalFormValue(formData.get("capabilityKey")),
    availability: readOptionalFormValue(formData.get("availability")),
  });
}
