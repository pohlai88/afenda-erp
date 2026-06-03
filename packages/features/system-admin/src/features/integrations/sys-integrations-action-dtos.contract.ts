export type CreateApiCredentialActionData = {
  id: string;
  keyPrefix: string;
  rawKey: string;
};

export type CreateWebhookActionData = {
  id: string;
  signingSecret: string;
};
