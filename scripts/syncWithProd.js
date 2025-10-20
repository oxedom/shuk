const prodEnv = require("dotenv").config({ path: `./.env.production` }); // Load production env first

const prodEnvJson = JSON.stringify(prodEnv, null, 4);

const devEnv = require("dotenv").config({ path: `./.env.development` }); // Override with development env
const devEnvJson = JSON.stringify(devEnv, null, 4);

const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);
const prodPostgresUrl = JSON.parse(prodEnvJson)["parsed"]["POSTGRES_URL"]; // Store prod URL
const devPostgresUrl = JSON.parse(devEnvJson)["parsed"]["POSTGRES_URL"]; // Store dev URL

// exec(`psql -U ${process.env.DB_USERNAME} -d ${process.env.DB_NAME} -f ./psql-commands/drop.sql`)
//make a backup of the production database
async function syncWithProd() {
  try {
    // 1. Backup from production
    const backupFileName = `./backups/prod_${Date.now()}.dump`;
    console.log("Creating backup from production...");
    await execAsync(`pg_dump -Fc ${prodPostgresUrl} -f ${backupFileName}`);

    // 1.1. Upload backup to Backblaze B2 using rclone
    // console.log('Uploading backup to Backblaze B2...')
    // // Replace "your-b2-remote:your-bucket-name/" with your rclone remote and B2 bucket name
    // await execAsync(`rclone copy ${backupFileName} your-b2-remote:your-bucket-name/`)

    // 2. Drop tables in development
    console.log("Dropping tables in development...");
    await execAsync(
      `psql ${devPostgresUrl} -f ./scripts/psql-commands/drop.sql`,
    );

    // 3. Run migrations
    // console.log('Running migrations...')
    // await execAsync(`pnpm migrate:up:dev`)

    // 4. Restore the backup to development
    console.log("Restoring backup to development...");
    await execAsync(
      `pg_restore --no-owner --no-privileges -d ${devPostgresUrl} ${backupFileName}`,
    );

    // 5. Select all data from development
    console.log("Selecting all data from development...");
    const res = await execAsync(
      `psql ${devPostgresUrl} -c "SELECT * FROM users;"`,
    );
    console.log(res.stdout);

    console.log("Sync completed successfully!");
  } catch (error) {
    console.error("Error during sync:", error);
  }
}

syncWithProd();
