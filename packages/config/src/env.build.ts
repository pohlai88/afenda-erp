import { z } from "zod";

const ciBuildEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_STAGE: z.string().min(1),
});

/** Fail fast in CI/Vercel when required public build env is missing. */
export function assertCiBuildEnv(input: NodeJS.ProcessEnv = process.env) {
  if (!input.CI && !input.VERCEL) {
    return;
  }

  ciBuildEnvSchema.parse(input);
}
