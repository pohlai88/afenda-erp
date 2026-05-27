import { strict as assert } from "node:assert";
import {
  AUTH_USER_GUC_KEY,
  ORGANIZATION_GUC_KEY,
  authUserGucSql,
  getRlsEvaluationSummary,
  organizationGucSql,
} from "../src/index";

const summary = getRlsEvaluationSummary();

assert.ok(summary.candidateTables >= 7, "expected tenant-scoped RLS candidates");
assert.ok(summary.blockedTables >= 1, "expected at least one global table exception");
assert.match(summary.nextStep, /runWithOrganizationContext/);
assert.equal(ORGANIZATION_GUC_KEY, "afenda.current_organization_id");
assert.equal(AUTH_USER_GUC_KEY, "afenda.auth_user_id");
assert.match(organizationGucSql("org_demo"), /afenda\.current_organization_id/);
assert.match(authUserGucSql("user_demo"), /afenda\.auth_user_id/);

process.stdout.write(
  `RLS evaluation passed for ${summary.candidateTables} candidate table(s).\n`,
);
