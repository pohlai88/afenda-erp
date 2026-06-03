import { z } from "zod";

export const objectStorageProviderPreferenceSchema = z.enum([
  "default",
  "vercel-blob",
  "r2",
  "s3",
]);

export const updateOrganizationObjectStorageProviderInputSchema = z.object({
  objectStorageProvider: objectStorageProviderPreferenceSchema,
});

export type UpdateOrganizationObjectStorageProviderInput = z.infer<
  typeof updateOrganizationObjectStorageProviderInputSchema
>;

export function mapObjectStorageProviderPreferenceToColumn(
  preference: UpdateOrganizationObjectStorageProviderInput["objectStorageProvider"],
): "vercel-blob" | "r2" | "s3" | null {
  if (preference === "default") {
    return null;
  }

  return preference;
}
