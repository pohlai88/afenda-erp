import "server-only";

import { z } from "zod";
import { getNeonAuthServer, isNeonAuthReady } from "./neon-auth.server";

export type NeonAuthSessionPayload = {
  session: {
    id: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

const neonAuthSessionPayloadSchema = z.object({
  session: z.object({
    id: z.string().min(1),
    expiresAt: z.coerce.date(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
  user: z.object({
    id: z.string().min(1),
    name: z.string(),
    email: z.email(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
});

/** @see https://neon.com/docs/auth/reference/nextjs-server#authgetsession */
export async function readNeonAuthSessionPayload(): Promise<NeonAuthSessionPayload | null> {
  if (!isNeonAuthReady()) return null;

  try {
    const { data, error } = await getNeonAuthServer().getSession();
    if (error || !data || typeof data !== "object") return null;
    const parsed = neonAuthSessionPayloadSchema.safeParse(data);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
