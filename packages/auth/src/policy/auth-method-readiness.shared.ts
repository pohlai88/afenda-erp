export type AuthMethodReadiness = {
  password: boolean;
  emailVerification: boolean;
  forgotPassword: boolean;
  magicLink: boolean;
  emailOtp: boolean;
  google: boolean;
  devAccess: boolean;
};

export type AuthMethodReadinessReason =
  | "ready"
  | "neon_disabled"
  | "provider_not_configured"
  | "email_delivery_unavailable"
  | "dev_only";

export type AuthMethodReadinessState = {
  methods: AuthMethodReadiness;
  reasons: Record<keyof AuthMethodReadiness, AuthMethodReadinessReason>;
};

type AuthMethodReadinessEnv = Record<string, string | undefined>;

function envFlag(value: string | undefined): boolean {
  return value === "1" || value?.toLowerCase() === "true";
}

export function resolveAuthMethodReadiness({
  neonAuthReady,
  devCookieAuthEnabled,
  env = process.env,
}: {
  neonAuthReady: boolean;
  devCookieAuthEnabled: boolean;
  env?: AuthMethodReadinessEnv;
}): AuthMethodReadinessState {
  const emailDeliveryReady = envFlag(env.AFENDA_AUTH_EMAIL_DELIVERY_READY);
  const googleReady = neonAuthReady && envFlag(env.AFENDA_AUTH_GOOGLE_ENABLED);
  const emailOtpReady =
    neonAuthReady &&
    emailDeliveryReady &&
    envFlag(env.AFENDA_AUTH_EMAIL_OTP_ENABLED);
  const magicLinkReady =
    neonAuthReady &&
    emailDeliveryReady &&
    envFlag(env.AFENDA_AUTH_MAGIC_LINK_ENABLED);
  const forgotPasswordReady =
    neonAuthReady &&
    (env.AFENDA_AUTH_FORGOT_PASSWORD_ENABLED === undefined ||
      envFlag(env.AFENDA_AUTH_FORGOT_PASSWORD_ENABLED));
  const emailVerificationReady =
    neonAuthReady &&
    (env.AFENDA_AUTH_EMAIL_VERIFICATION_ENABLED === undefined ||
      envFlag(env.AFENDA_AUTH_EMAIL_VERIFICATION_ENABLED));

  const methods: AuthMethodReadiness = {
    password: neonAuthReady,
    emailVerification: emailVerificationReady,
    forgotPassword: forgotPasswordReady,
    magicLink: magicLinkReady,
    emailOtp: emailOtpReady,
    google: googleReady,
    devAccess: !neonAuthReady && devCookieAuthEnabled,
  };

  return {
    methods,
    reasons: {
      password: methods.password ? "ready" : "neon_disabled",
      emailVerification: methods.emailVerification
        ? "ready"
        : "email_delivery_unavailable",
      forgotPassword: methods.forgotPassword
        ? "ready"
        : "email_delivery_unavailable",
      magicLink: methods.magicLink
        ? "ready"
        : emailDeliveryReady
          ? "provider_not_configured"
          : "email_delivery_unavailable",
      emailOtp: methods.emailOtp
        ? "ready"
        : emailDeliveryReady
          ? "provider_not_configured"
          : "email_delivery_unavailable",
      google: methods.google ? "ready" : "provider_not_configured",
      devAccess: methods.devAccess ? "dev_only" : "neon_disabled",
    },
  };
}
