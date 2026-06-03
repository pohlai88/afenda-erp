import { z } from "zod";

export {
  parseUpdateHrEmployeeStatutoryRequirementForm,
  updateHrEmployeeStatutoryRequirementFormSchema,
} from "./hr.workforce.compliance-requirement-trailing.schema";

export type { UpdateHrEmployeeStatutoryRequirementFormInput } from "./hr.workforce.compliance-requirement-trailing.schema";

export const syncHrEmployeeStatutoryRequirementsFormSchema = z.object({});
