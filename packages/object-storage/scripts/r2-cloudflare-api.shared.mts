import type Cloudflare from "cloudflare";

import {
  apexDomainFromHostname,
  createCloudflareClient,
  getCloudflareAccountId,
} from "./cloudflare-client.shared.mts";

type R2CorsRule = {
  allowed: {
    origins: string[];
    methods: string[];
    headers: string[];
  };
  exposeHeaders?: string[];
  maxAgeSeconds?: number;
};

type R2CustomDomain = {
  domain: string;
  enabled: boolean;
  zoneId: string;
  minTLS?: string;
};

type R2ManagedDomain = {
  bucketId: string;
  domain: string;
  enabled: boolean;
};

export type R2CloudflareSnapshot = {
  accountId: string;
  bucket: string;
  zones: Array<{ id: string; name: string; status: string }>;
  customDomains: R2CustomDomain[];
  managedDomain: R2ManagedDomain | null;
  corsRules: R2CorsRule[];
};

function r2Path(accountId: string, bucket: string, suffix: string) {
  return `/accounts/${accountId}/r2/buckets/${bucket}${suffix}`;
}

export async function resolveZoneIdForHostname(
  client: Cloudflare,
  hostname: string,
  accountId = getCloudflareAccountId(),
): Promise<string | undefined> {
  const apex = apexDomainFromHostname(hostname);

  for await (const zone of client.zones.list({
    account: { id: accountId },
    name: apex,
  })) {
    return zone.id;
  }

  return undefined;
}

export async function listAccountZones(
  client: Cloudflare,
  accountId = getCloudflareAccountId(),
) {
  const zones: Array<{ id: string; name: string; status: string }> = [];

  for await (const zone of client.zones.list({ account: { id: accountId } })) {
    zones.push({
      id: zone.id,
      name: zone.name,
      status: zone.status ?? "unknown",
    });
  }

  return zones;
}

export async function getR2CloudflareSnapshot(
  client: Cloudflare,
  bucket: string,
  accountId = getCloudflareAccountId(),
): Promise<R2CloudflareSnapshot> {
  const [zones, customResponse, managedResponse, corsResponse] =
    await Promise.all([
      listAccountZones(client, accountId),
      client.get(r2Path(accountId, bucket, "/domains/custom")),
      client.get(r2Path(accountId, bucket, "/domains/managed")),
      client.get(r2Path(accountId, bucket, "/cors")),
    ]);

  const customBody = customResponse as {
    domains?: R2CustomDomain[];
  };
  const managedBody = managedResponse as R2ManagedDomain;
  const corsBody = corsResponse as { rules?: R2CorsRule[] };

  return {
    accountId,
    bucket,
    zones,
    customDomains: customBody.domains ?? [],
    managedDomain: managedBody?.domain ? managedBody : null,
    corsRules: corsBody.rules ?? [],
  };
}

export async function attachR2CustomDomain(input: {
  bucket: string;
  domain: string;
  zoneId: string;
  minTls?: string;
  accountId?: string;
  client?: Cloudflare;
}) {
  const client = input.client ?? createCloudflareClient();
  const accountId = input.accountId ?? getCloudflareAccountId();

  return client.post(r2Path(accountId, input.bucket, "/domains/custom"), {
    body: {
      domain: input.domain,
      zoneId: input.zoneId,
      enabled: true,
      minTLS: input.minTls ?? "1.2",
    },
  });
}

export async function disableR2ManagedDomain(input: {
  bucket: string;
  accountId?: string;
  client?: Cloudflare;
}) {
  const client = input.client ?? createCloudflareClient();
  const accountId = input.accountId ?? getCloudflareAccountId();

  return client.put(r2Path(accountId, input.bucket, "/domains/managed"), {
    body: { enabled: false },
  });
}

export async function setR2BucketCors(input: {
  bucket: string;
  rules: R2CorsRule[];
  accountId?: string;
  client?: Cloudflare;
}) {
  const client = input.client ?? createCloudflareClient();
  const accountId = input.accountId ?? getCloudflareAccountId();

  return client.put(r2Path(accountId, input.bucket, "/cors"), {
    body: { rules: input.rules },
  });
}
