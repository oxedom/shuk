/* sync-staging-to-dev.js
 *
 * Clone the staging database into the local-development database.
 * --no-owner / --no-acl  ⇒  מתעלם מהרשאות ורולים שלא קיימים בלוקאל
 * --clean / --if-exists ⇒  מפיל אובייקטים מתנגשים לפני שחזור
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

// Load environment variables
const stagingEnv = require("dotenv").config({ path: "./.env.staging" });
const devEnv = require("dotenv").config({ path: "./.env.development" });

const stagingPostgresUrl = stagingEnv.parsed?.POSTGRES_URL;
const devPostgresUrl = devEnv.parsed?.POSTGRES_URL;

if (!stagingPostgresUrl || !devPostgresUrl) {
  console.error("❌  Missing POSTGRES_URL in one of the env files");
  process.exit(1);
}

async function syncStagingToDev() {
  const backupDir = path.resolve(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const backupFile = path.join(backupDir, `staging_${Date.now()}.dump`);

  try {
    console.log("🚀  Starting staging → development sync");

    // 1. Dump staging (schema + data, no owners / ACLs)
    console.log("📦  Creating backup from staging…");
    await execAsync(
      `pg_dump --format=c --verbose --no-owner --no-acl --dbname='${stagingPostgresUrl}' --file='${backupFile}'`,
    );
    console.log(`✅  Backup saved to ${backupFile}`);

    // 2. Restore into development (drop conflicting objects, ignore ACL/owner)
    console.log("🔄  Restoring backup to development…");
    await execAsync(
      `pg_restore --verbose --clean --if-exists --no-owner --no-acl --dbname='${devPostgresUrl}' '${backupFile}'`,
    );
    console.log("🎉  Development database now mirrors staging!");
  } catch (err) {
    console.error("❌  Sync failed:", err.stderr || err);
    process.exit(1);
  }
}

syncStagingToDev();
