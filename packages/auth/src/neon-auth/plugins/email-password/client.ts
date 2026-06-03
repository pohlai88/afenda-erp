"use client";

import { neonAuthClient } from "../../runtime/neon-auth.client";

export const neonEmailPasswordClient = {
  signIn: neonAuthClient.signIn.email,
  signUp: neonAuthClient.signUp.email,
};
