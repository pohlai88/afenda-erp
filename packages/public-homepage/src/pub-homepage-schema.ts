import { z } from "zod";

export const homepageContentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  signInLabel: z.string().min(1),
  signInHref: z.string().startsWith("/"),
  signUpLabel: z.string().min(1),
  signUpHref: z.string().startsWith("/"),
  introBrandMark: z.string().min(1),
  introStatusLabel: z.string().min(1),
  introPillars: z.array(z.string().min(1)).min(1),
  introVisionLabel: z.string().min(1),
  introVisionValue: z.string().min(1),
  introFooterLabel: z.string().min(1),
  introLockupTitle: z.string().min(1),
  introLockupSubtitle: z.string().min(1),
  introLockupAriaLabel: z.string().min(1),
  introSkipLabel: z.string().min(1),
});

export type HomepageContent = z.infer<typeof homepageContentSchema>;
