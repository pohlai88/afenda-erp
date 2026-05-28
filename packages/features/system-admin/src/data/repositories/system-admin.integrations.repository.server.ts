import {
  listApiCredentials as listApiCredentialsFromDb,
  listSsoConnections as listSsoConnectionsFromDb,
  listWebhookDeliveries as listWebhookDeliveriesFromDb,
  listWebhooks as listWebhooksFromDb,
} from "@afenda/db";

export function listApiCredentials(
  input: Parameters<typeof listApiCredentialsFromDb>[0],
) {
  return listApiCredentialsFromDb(input);
}

export function listSsoConnections(
  input: Parameters<typeof listSsoConnectionsFromDb>[0],
) {
  return listSsoConnectionsFromDb(input);
}

export function listWebhookDeliveries(
  input: Parameters<typeof listWebhookDeliveriesFromDb>[0],
) {
  return listWebhookDeliveriesFromDb(input);
}

export function listWebhooks(input: Parameters<typeof listWebhooksFromDb>[0]) {
  return listWebhooksFromDb(input);
}
