import { readOptionalFormValue } from "../../tenant-execution/contracts/system-admin.execution-settings.shared";
import { systemAdminBillingContactsSchema } from "../schemas/system-admin.billing-contact.schema";

function readOptionalContactPair(
  formData: FormData,
  prefix: "invoice" | "procurement",
) {
  const name = readOptionalFormValue(formData.get(`${prefix}Name`));
  const email = readOptionalFormValue(formData.get(`${prefix}Email`));

  if (name && email) {
    return { name, email };
  }

  return undefined;
}

export function parseSystemAdminBillingContactsFormData(formData: FormData) {
  return systemAdminBillingContactsSchema.safeParse({
    primary: {
      name: readOptionalFormValue(formData.get("primaryName")) ?? "",
      email: readOptionalFormValue(formData.get("primaryEmail")) ?? "",
    },
    invoice: readOptionalContactPair(formData, "invoice"),
    procurement: readOptionalContactPair(formData, "procurement"),
  });
}
