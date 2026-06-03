"use client";

import { neonAuthClient } from "../../runtime/neon-auth.client";

export const neonAccountClient = {
  updateUser: neonAuthClient.updateUser,
  changePassword: neonAuthClient.changePassword,
  sendVerificationEmail: neonAuthClient.sendVerificationEmail,
  deleteUser: neonAuthClient.deleteUser,
};
