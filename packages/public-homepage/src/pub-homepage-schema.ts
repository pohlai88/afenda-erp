import { z } from "zod";

export const homepageContentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  signInLabel: z.string().min(1),
  signInHref: z.string().startsWith("/"),
});

export type HomepageContent = z.infer<typeof homepageContentSchema>;
