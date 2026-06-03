/** @see https://neon.com/docs/auth/guides/plugins/phone-number */
export const deferredNeonPhoneNumberClientMethods = ["phoneNumber.sendOtp", "phoneNumber.verify"] as const;
export const neonPhoneNumberWebhookHandlers = {
  implemented: ["phone_number.verified"] as const,
  blockingRequiresImplementation: ["send.otp.sms"] as const,
};
