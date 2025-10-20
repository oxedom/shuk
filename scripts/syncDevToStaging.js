/* sync-dev-to-staging.js
 *
 * Clone the development database into the staging database.
 * --no-owner / --no-acl  ⇒  Ignore permissions and roles that don't exist in staging
 * --clean / --if-exists ⇒  Drop conflicting objects before restore
 * Then anonymizes personal data in staging for privacy compliance.
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");
const { Client } = require("pg");
const execAsync = promisify(exec);

// Load environment variables
const devEnv = require("dotenv").config({ path: "./.env.development" });
const stagingEnv = require("dotenv").config({ path: "./.env.staging" });

const devPostgresUrl = devEnv.parsed?.POSTGRES_URL;
const stagingPostgresUrl = stagingEnv.parsed?.POSTGRES_URL;

if (!devPostgresUrl || !stagingPostgresUrl) {
  console.error("❌  Missing POSTGRES_URL in one of the env files");
  process.exit(1);
}

// Anonymization SQL
const anonymizationSQL = `
-- Anonymize User Personal Data
BEGIN;

-- Update personal data with anonymized values
UPDATE users SET
  first_name = 'User',
  last_name = CONCAT('', user_id),
  phone = CASE 
    WHEN phone IS NOT NULL THEN CONCAT('+1555000', LPAD(user_id::text, 4, '0'))
    ELSE NULL
  END,
  birthday = NULL
WHERE user_id IS NOT NULL;

COMMIT;
`;

async function anonymizeStaging() {
  console.log("🔒  Anonymizing personal data in staging...");

  const client = new Client({
    connectionString: stagingPostgresUrl,
  });

  try {
    await client.connect();

    // Run anonymization
    await client.query(anonymizationSQL);

    // Verify anonymization worked
    const result = await client.query(`
      SELECT COUNT(*) as total_users,
             COUNT(CASE WHEN first_name = 'User' THEN 1 END) as anonymized_users
      FROM users
    `);

    const { total_users, anonymized_users } = result.rows[0];
    console.log(
      `✅  Anonymized ${anonymized_users}/${total_users} users successfully`,
    );

    if (parseInt(anonymized_users) === parseInt(total_users)) {
      console.log("🎉  All users have been anonymized!");
    } else {
      throw new Error(
        `Anonymization incomplete: ${anonymized_users}/${total_users} users anonymized`,
      );
    }
  } catch (error) {
    console.error("❌  Anonymization failed:", error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function syncDevToStaging() {
  const backupDir = path.resolve(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const backupFile = path.join(backupDir, `dev_${Date.now()}.dump`);

  try {
    console.log("🚀  Starting development → staging sync");

    // 1. Dump development (schema + data, no owners / ACLs)
    console.log("📦  Creating backup from development…");
    await execAsync(
      `pg_dump --format=c --verbose --no-owner --no-acl --dbname='${devPostgresUrl}' --file='${backupFile}'`,
    );
    console.log(`✅  Backup saved to ${backupFile}`);

    // 2. Restore into staging (drop conflicting objects, ignore ACL/owner)
    console.log("🔄  Restoring backup to staging…");
    await execAsync(
      `pg_restore --verbose --clean --if-exists --no-owner --no-acl --dbname='${stagingPostgresUrl}' '${backupFile}'`,
    );
    console.log("✅  Staging database restored from development!");

    // 3. Anonymize personal data in staging
    await anonymizeStaging();

    console.log(
      "🎉  Staging sync completed successfully with anonymized data!",
    );
  } catch (err) {
    console.error("❌  Sync failed:", err.stderr || err.message || err);
    process.exit(1);
  }
}

syncDevToStaging();
