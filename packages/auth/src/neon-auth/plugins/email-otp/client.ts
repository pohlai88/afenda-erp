"use client";

import { neonAuthClient } from "../../runtime/neon-auth.client";

export const neonEmailOtpClient = {
  signIn: neonAuthClient.signIn.emailOtp,
  sendVerificationOtp: neonAuthClient.emailOtp.sendVerificationOtp,
  verifyEmail: neonAuthClient.emailOtp.verifyEmail,
  resetPassword: neonAuthClient.emailOtp.resetPassword,
};
