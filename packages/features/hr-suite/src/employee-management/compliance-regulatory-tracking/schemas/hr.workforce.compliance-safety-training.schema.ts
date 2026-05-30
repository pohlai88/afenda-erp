import { z } from "zod";

export {
  parseUpdateHrEmployeeSafetyTrainingRequirementForm,
  updateHrEmployeeSafetyTrainingRequirementFormSchema,
} from "./hr.workforce.compliance-requirement-trailing.schema";

export type { UpdateHrEmployeeSafetyTrainingRequirementFormInput } from "./hr.workforce.compliance-requirement-trailing.schema";

export const syncHrEmployeeSafetyTrainingRequirementsFormSchema = z.object({});
