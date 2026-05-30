import { z } from "zod";

export const hrOffboardingExitTypeSchema = z.enum([
  "resignation",
  "termination",
  "retirement",
  "contract_expiry",
  "redundancy",
  "death",
  "mutual_separation",
]);

export type HrOffboardingExitTypeValue = z.infer<
  typeof hrOffboardingExitTypeSchema
>;
