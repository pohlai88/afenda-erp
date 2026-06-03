export const loggerServiceName = "afenda-erp";

export const redactedValue = "[redacted]";

export const sensitiveLogKeyFragments = [
  "authorization",
  "body",
  "cardnumber",
  "card_number",
  "cookie",
  "credential",
  "cvv",
  "identity",
  "identitydocument",
  "identity_document",
  "payment",
  "paymentcredential",
  "payment_credential",
  "password",
  "payload",
  "private_document",
  "rawbody",
  "raw_body",
  "secret",
  "token",
  "apikey",
  "api_key",
  "privatekey",
  "private_key",
  "session",
] as const;

export const maxLoggedStringLength = 2_000;
export const maxLoggedArrayLength = 20;
export const maxLoggedObjectEntries = 40;
export const maxRedactionDepth = 8;
