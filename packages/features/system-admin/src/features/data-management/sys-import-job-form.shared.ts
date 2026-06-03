import { readOptionalFormValue } from "../../tenant-execution/contracts/system-admin.execution-settings.shared";
import { createSystemAdminImportJobSchema } from "../schemas/system-admin.import-job.schema";

export function parseSystemAdminImportJobFormData(formData: FormData) {
  const filename = readOptionalFormValue(formData.get("filename"));

  return createSystemAdminImportJobSchema.safeParse({
    templateId: readOptionalFormValue(formData.get("templateId")),
    sourceLabel: readOptionalFormValue(formData.get("sourceLabel")),
    filename: filename || undefined,
    sourceData: readOptionalFormValue(formData.get("sourceData")),
  });
}
