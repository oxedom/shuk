const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: "./.env.production" });

// Table export order (respecting foreign key dependencies)
const TABLES_ORDER = [
  "gyms",
  "muscles",
  "users",
  "exercises",
  "videos",
  "exercise_muscles_type",
  "program_plans",
  "program_plan_workouts",
  "program_plan_workout_exercises",
  "workout_instances",
  "workout_activities",
  "exercise_comments",
  "workout_comments",
];

async function exportProductionData() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    console.log("🔌 Connecting to production database (READ-ONLY)...");
    await client.connect();
    console.log("✅ Connected successfully\n");

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        timestamp: Date.now(),
        source: "production",
      },
      tables: {},
      stats: {},
    };

    // Export each table
    for (const table of TABLES_ORDER) {
      console.log(`📊 Exporting table: ${table}...`);

      try {
        const result = await client.query(`SELECT * FROM ${table} ORDER BY 1`);
        exportData.tables[table] = result.rows;
        exportData.stats[table] = result.rows.length;

        console.log(`   ✓ Exported ${result.rows.length} rows from ${table}`);
      } catch (error) {
        console.error(`   ✗ Error exporting ${table}:`, error.message);
        throw error;
      }
    }

    // Save to file
    const timestamp = Date.now();
    const filename = `prod-data-export-${timestamp}.json`;
    const filepath = path.join(__dirname, "../../backups", filename);

    // Ensure backups directory exists
    const backupsDir = path.join(__dirname, "../../backups");
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));

    console.log("\n✅ Export completed successfully!");
    console.log(`📁 File saved to: ${filepath}`);
    console.log("\n📊 Export Summary:");
    console.log("─".repeat(50));

    let totalRows = 0;
    for (const [table, count] of Object.entries(exportData.stats)) {
      console.log(
        `   ${table.padEnd(35)} ${count.toString().padStart(8)} rows`,
      );
      totalRows += count;
    }
    console.log("─".repeat(50));
    console.log(
      `   ${"TOTAL".padEnd(35)} ${totalRows.toString().padStart(8)} rows\n`,
    );

    return filepath;
  } catch (error) {
    console.error("\n❌ Export failed:", error.message);
    throw error;
  } finally {
    await client.end();
    console.log("🔌 Database connection closed");
  }
}

// Run the export
exportProductionData()
  .then((filepath) => {
    console.log(
      `\n✨ Success! Use this file for import:\n   node scripts/export-import/import-to-staging.js ${filepath}`,
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
