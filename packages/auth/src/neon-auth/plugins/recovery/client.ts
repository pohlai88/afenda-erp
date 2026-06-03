"use client";

import { neonAuthClient } from "../../runtime/neon-auth.client";

export const neonRecoveryClient = {
  forgetPassword: neonAuthClient.forgetPassword,
  resetPassword: neonAuthClient.resetPassword,
  emailOtpResetPassword: neonAuthClient.emailOtp.resetPassword,
};
