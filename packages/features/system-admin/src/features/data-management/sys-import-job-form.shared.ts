import { readOptionalFormValue } from "../tenant-execution/sys-execution-settings.shared";
import { createSystemAdminImportJobSchema } from "./sys-import-job.schema";

export function parseSystemAdminImportJobFormData(formData: FormData) {
  const filename = readOptionalFormValue(formData.get("filename"));

  return createSystemAdminImportJobSchema.safeParse({
    templateId: readOptionalFormValue(formData.get("templateId")),
    sourceLabel: readOptionalFormValue(formData.get("sourceLabel")),
    filename: filename || undefined,
    sourceData: readOptionalFormValue(formData.get("sourceData")),
  });
}
