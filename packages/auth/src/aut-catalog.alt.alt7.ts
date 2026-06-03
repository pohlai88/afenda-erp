/** @see https://neon.com/docs/auth/guides/plugins/phone-number */
export const implementedNeonPhoneNumberClientMethods = [
  "phoneNumber.sendOtp",
  "phoneNumber.verifyOtp",
] as const;

export const implementedNeonPhoneNumberWebhookHandlers = [
  "send.otp.sms",
  "phone_number.verified",
] as const;
