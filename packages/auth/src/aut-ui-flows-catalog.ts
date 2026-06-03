/** Active Neon Auth UI flows on production branch (MCP Jun 2026). Phone OTP intentionally off. */
export const activeNeonAuthUiFlows = {
  emailPassword: true,
  emailVerificationOtp: true,
  emailOtpSignIn: true,
  magicLink: true,
  forgotPassword: true,
  resetPassword: true,
  googleOAuth: true,
  phoneOtp: false,
  githubOAuth: false,
  vercelOAuth: false,
} as const;
