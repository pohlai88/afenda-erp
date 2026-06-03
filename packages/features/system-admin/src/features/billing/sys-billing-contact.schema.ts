import { z } from "zod";

const billingContactEntrySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
});

export const systemAdminBillingContactsSchema = z.object({
  primary: billingContactEntrySchema,
  invoice: billingContactEntrySchema.optional(),
  procurement: billingContactEntrySchema.optional(),
});

export type SystemAdminBillingContactsInput = z.infer<
  typeof systemAdminBillingContactsSchema
>;

export const systemAdminBillingContactsStoredSchema = z.object({
  primary: billingContactEntrySchema.optional(),
  invoice: billingContactEntrySchema.optional(),
  procurement: billingContactEntrySchema.optional(),
});

export type SystemAdminBillingContactsStored = z.infer<
  typeof systemAdminBillingContactsStoredSchema
>;
