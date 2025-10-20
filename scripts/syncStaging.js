const prodEnv = require("dotenv").config({ path: `./.env.production` }); // Load production env first

const prodEnvJson = JSON.stringify(prodEnv, null, 4);

const stagingEnv = require("dotenv").config({ path: `./.env.staging` }); // Override with development env
const stagingEnvJson = JSON.stringify(stagingEnv, null, 4);

const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);
const prodPostgresUrl = JSON.parse(prodEnvJson)["parsed"]["POSTGRES_URL"]; // Store prod URL
const stagingPostgresUrl = JSON.parse(stagingEnvJson)["parsed"]["POSTGRES_URL"]; // Store staging URL

async function syncStaging() {
  try {
    // 1. Backup from production
    // const backupFileName = `./backups/prod_${Date.now()}.dump`;
    // console.log("Creating backup from production...");
    // await execAsync(
    //   `pg_dump -Fc -v -d ${prodPostgresUrl} -f ${backupFileName}`,
    // );

    // console.log("Backup created successfully!");
    // console.log("--------------------------------");
    // console.log(backupFileName);
    // console.log("--------------------------------");

    const backupFileName = `./backups/prod_1750874608489.dump`;
    console.log(backupFileName);
    // 2. Drop tables in staging
    console.log("Dropping tables in staging...");
    await execAsync(
      `psql ${stagingPostgresUrl} -f ./scripts/psql-commands/nuke.sql`,
    );

    // 4. Restore the backup to staging
    console.log("Restoring backup to staging...");
    await execAsync(
      `pg_restore -v -d --no-owner ${stagingPostgresUrl} ${backupFileName}`,
    );

    // // 5. Select all data from development
    // console.log("Selecting all data from development...");
    // const res = await execAsync(
    //   `psql ${stagingPostgresUrl} -c "SELECT * FROM users;"`,
    // );
    // console.log(res.stdout);

    console.log("Sync completed successfully!");
  } catch (error) {
    console.error("Error during sync:", error);
  }
}

syncStaging();
