"use client";

import { neonAuthClient } from "../../runtime/neon-auth.client";

export const neonOAuthClient = {
  signIn: neonAuthClient.signIn.social,
};
