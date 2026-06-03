/** @see https://neon.com/docs/auth/guides/plugins/phone-number */
export const deferredNeonPhoneNumberClientMethods = [
  "phoneNumber.sendOtp",
  "phoneNumber.verify.sign-in",
  "phoneNumber.verify.updatePhoneNumber",
] as const;

export const neonPhoneNumberWebhookHandlers = {
  implemented: ["phone_number.verified"] as const,
  /** Requires send.otp webhook with event_data.delivery_preference === "sms". */
  blockingRequiresImplementation: ["send.otp"] as const,
} as const;

export type DeferredNeonPhoneNumberClientMethod =
  (typeof deferredNeonPhoneNumberClientMethods)[number];

/** Documented alias: Neon emits send.otp with event_data.delivery_preference === "sms". */
export const neonPhoneNumberSmsOtpWebhookEvent = "send.otp" as const;
