import { getDatabaseEnv } from "@afenda/config/env";
import { Pool } from "@neondatabase/serverless";
import { sql, type SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

export const ORGANIZATION_GUC_KEY = "afenda.current_organization_id";
export const AUTH_USER_GUC_KEY = "afenda.auth_user_id";

export type AfendaDb = ReturnType<typeof createDatabase>;
export type AfendaTransaction = Parameters<
  Parameters<AfendaDb["transaction"]>[0]
>[0];
type TenantContextExecutor = {
  execute: (query: SQL) => Promise<unknown>;
};

function createDatabase(pool: Pool) {
  return drizzle({
    client: pool,
    schema,
    casing: "snake_case",
  });
}

function getPool() {
  const env = getDatabaseEnv();

  return new Pool({
    connectionString: env.DATABASE_URL,
  });
}

let database: AfendaDb | null = null;

export function getDb() {
  if (!database) {
    database = createDatabase(getPool());
  }

  return database;
}

async function applyOrganizationGuc(
  db: TenantContextExecutor,
  organizationId: string,
) {
  await db.execute(
    sql`select set_config(${ORGANIZATION_GUC_KEY}, ${organizationId}, true)`,
  );
}

async function applyAuthUserGuc(db: TenantContextExecutor, authUserId: string) {
  await db.execute(
    sql`select set_config(${AUTH_USER_GUC_KEY}, ${authUserId}, true)`,
  );
}

export async function runWithOrganizationContext<T>(
  organizationId: string,
  callback: (db: AfendaTransaction) => Promise<T>,
) {
  const db = getDb();

  return db.transaction(async (tx) => {
    await applyOrganizationGuc(tx, organizationId);
    return callback(tx);
  });
}

export async function runWithAuthUserContext<T>(
  authUserId: string,
  callback: (db: AfendaTransaction) => Promise<T>,
) {
  const db = getDb();

  return db.transaction(async (tx) => {
    await applyAuthUserGuc(tx, authUserId);
    return callback(tx);
  });
}

export async function runWithBootstrapContext<T>(
  authUserId: string,
  organizationId: string,
  callback: (db: AfendaTransaction) => Promise<T>,
) {
  const db = getDb();

  return db.transaction(async (tx) => {
    await applyAuthUserGuc(tx, authUserId);
    await applyOrganizationGuc(tx, organizationId);
    return callback(tx);
  });
}

export async function readOrganizationGuc(db: TenantContextExecutor) {
  const result = await db.execute(
    sql`select current_setting(${ORGANIZATION_GUC_KEY}, true) as organization_id`,
  );
  const rows = Array.isArray(result)
    ? result
    : ((result as { rows?: Array<{ organization_id: string }> }).rows ?? []);

  return rows[0]?.organization_id ?? "";
}

export function organizationGucSql(organizationId: string) {
  return `select set_config('${ORGANIZATION_GUC_KEY}', '${organizationId.replace(/'/g, "''")}', true)`;
}

export function authUserGucSql(authUserId: string) {
  return `select set_config('${AUTH_USER_GUC_KEY}', '${authUserId.replace(/'/g, "''")}', true)`;
}
