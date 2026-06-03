"use client";

import { neonAuthClient } from "../../runtime/neon-auth.client";

export const neonMagicLinkClient = {
  signIn: neonAuthClient.signIn.magicLink,
};
