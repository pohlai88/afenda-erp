import { config as loadEnv } from "dotenv";
import {
  runTenantHousekeepingSweep,
  runTenantReminderSweep,
  runTenantSyncSweep,
} from "../src/workflow-sweeps";

loadEnv({ path: "../../.env.local" });
loadEnv({ path: "../../.env.config" });
loadEnv({ path: "../../.secret.config", override: true });

async function main() {
  const [reminders, syncs, housekeeping] = await Promise.all([
    runTenantReminderSweep(),
    runTenantSyncSweep(),
    runTenantHousekeepingSweep(),
  ]);

  for (const result of [reminders, syncs, housekeeping]) {
    if (result.organizationCount < 0) {
      throw new Error("Workflow sweep returned an invalid organization count.");
    }

    if (!["healthy", "watch"].includes(result.status)) {
      throw new Error(`Unexpected sweep status: ${result.status}`);
    }
  }

  console.log(
    `Workflow sweeps passed for ${reminders.organizationCount} organization(s).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
