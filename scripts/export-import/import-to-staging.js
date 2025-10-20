const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

// Load staging environment
require("dotenv").config({ path: "./.env.staging" });

// Import Sequelize for raw queries
const { Sequelize } = require("sequelize");
const pg = require("pg");

// Table import order (same as export - respects foreign key dependencies)
const TABLES_ORDER = [
  { name: "gyms", idColumn: "gym_id" },
  { name: "muscles", idColumn: "muscle_id" },
  { name: "users", idColumn: "user_id" },
  { name: "exercises", idColumn: "exercise_id" },
  { name: "videos", idColumn: "video_id" },
  { name: "exercise_muscles_type", idColumn: "exercise_muscle_type_id" },
  { name: "program_plans", idColumn: "program_plan_id" },
  { name: "program_plan_workouts", idColumn: "program_plan_workout_id" },
  {
    name: "program_plan_workout_exercises",
    idColumn: "program_plan_workout_exercise_id",
  },
  { name: "workout_instances", idColumn: "workout_instance_id" },
  { name: "workout_activities", idColumn: "activity_id" },
  { name: "exercise_comments", idColumn: "exercise_comment_id" },
  { name: "workout_comments", idColumn: "workout_comment_id" },
];

async function resetSequence(sequelize, tableName, idColumn) {
  try {
    const sequenceName = `${tableName}_${idColumn}_seq`;
    const query = `
      SELECT setval('${sequenceName}', COALESCE((SELECT MAX(${idColumn}) FROM ${tableName}), 1), true);
    `;
    await sequelize.query(query);
    console.log(`   ✓ Reset sequence for ${tableName}`);
  } catch (error) {
    console.error(
      `   ✗ Error resetting sequence for ${tableName}:`,
      error.message,
    );
  }
}

async function dropAllTables() {
  console.log("\n🗑️  STEP 1: Dropping all tables and enums from staging...");

  const stagingUrl = process.env.POSTGRES_URL;
  const dropSqlPath = path.join(__dirname, "../psql-commands/drop.sql");

  try {
    const { stdout, stderr } = await execAsync(
      `psql ${stagingUrl} -f ${dropSqlPath}`,
    );

    if (stderr && !stderr.includes("NOTICE")) {
      console.log("   ⚠️  Warnings:", stderr);
    }

    console.log("   ✅ All tables and enums dropped successfully");
  } catch (error) {
    console.error("   ❌ Error dropping tables:", error.message);
    throw error;
  }
}

async function runMigrations() {
  console.log("\n🔧 STEP 2: Running migrations to recreate schema...");

  try {
    const { stdout, stderr } = await execAsync("pnpm migrate:up:staging", {
      cwd: path.join(__dirname, "../.."),
    });

    console.log("   ✅ Migrations completed successfully");
    if (stdout) {
      console.log(
        "   📝 Migration output:",
        stdout.split("\n").slice(0, 5).join("\n"),
      );
    }
  } catch (error) {
    console.error("   ❌ Error running migrations:", error.message);
    throw error;
  }
}

async function importData(jsonFilePath) {
  console.log("\n📥 STEP 3: Importing data to staging...");

  // Read and validate JSON file
  if (!fs.existsSync(jsonFilePath)) {
    throw new Error(`JSON file not found: ${jsonFilePath}`);
  }

  const exportData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

  if (!exportData.tables || !exportData.metadata) {
    throw new Error("Invalid JSON structure: missing tables or metadata");
  }

  console.log(`   📊 Source: ${exportData.metadata.source}`);
  console.log(`   📅 Export date: ${exportData.metadata.exportDate}`);

  // Initialize Sequelize
  const sequelize = new Sequelize(process.env.POSTGRES_URL, {
    dialectModule: pg,
    dialect: "postgres",
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log("   ✅ Connected to staging database\n");

    let totalImported = 0;

    // Import each table using raw SQL
    for (const table of TABLES_ORDER) {
      const data = exportData.tables[table.name];

      if (!data || data.length === 0) {
        console.log(`   ⊘ Skipping ${table.name} (no data)`);
        continue;
      }

      console.log(`   📋 Importing ${table.name}...`);

      try {
        // Get actual columns that exist in the target table
        const [tableColumns] = await sequelize.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${table.name}' 
          AND table_schema = 'public'
        `);
        const existingColumns = new Set(
          tableColumns.map((col) => col.column_name),
        );

        // Get columns from export data
        const exportColumns = Object.keys(data[0]);

        // Filter to only columns that exist in target table
        const columnsToInsert = exportColumns.filter((col) =>
          existingColumns.has(col),
        );

        // Warn about skipped columns
        const skippedColumns = exportColumns.filter(
          (col) => !existingColumns.has(col),
        );
        if (skippedColumns.length > 0) {
          console.log(
            `      ⚠️  Skipping columns not in target: ${skippedColumns.join(", ")}`,
          );
        }

        // Insert data in batches to avoid query size limits
        const batchSize = 100;
        let imported = 0;

        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);

          if (batch.length === 0) continue;

          // Quote column names to preserve case sensitivity (createdAt vs createdat)
          const columnNames = columnsToInsert
            .map((col) => `"${col}"`)
            .join(", ");

          // Build VALUES clause with placeholders
          const valuesPlaceholders = batch
            .map((_, batchIndex) => {
              const rowPlaceholders = columnsToInsert
                .map(
                  (_, colIndex) =>
                    `$${batchIndex * columnsToInsert.length + colIndex + 1}`,
                )
                .join(", ");
              return `(${rowPlaceholders})`;
            })
            .join(", ");

          // Flatten all values for the batch (only for columns that exist)
          const values = batch.flatMap((row) =>
            columnsToInsert.map((col) => row[col]),
          );

          // Execute INSERT
          const query = `INSERT INTO ${table.name} (${columnNames}) VALUES ${valuesPlaceholders}`;
          await sequelize.query(query, {
            bind: values,
            type: sequelize.QueryTypes.INSERT,
          });

          imported += batch.length;
        }

        totalImported += imported;
        console.log(`      ✓ Imported ${imported} rows`);

        // Reset sequence for this table
        await resetSequence(sequelize, table.name, table.idColumn);
      } catch (error) {
        console.error(`   ✗ Error importing ${table.name}:`, error.message);
        throw error;
      }
    }

    console.log(`\n   ✅ Successfully imported ${totalImported} total rows`);
  } catch (error) {
    console.error("\n   ❌ Import failed:", error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

async function main() {
  const jsonFilePath = process.argv[2];

  if (!jsonFilePath) {
    console.error("\n❌ Error: JSON file path is required");
    console.log("\nUsage:");
    console.log(
      "  node scripts/export-import/import-to-staging.js <path-to-json-file>\n",
    );
    console.log("Example:");
    console.log(
      "  node scripts/export-import/import-to-staging.js backups/prod-data-export-1234567890.json\n",
    );
    process.exit(1);
  }

  console.log("═".repeat(60));
  console.log("  STAGING DATABASE IMPORT - DESTRUCTIVE OPERATION");
  console.log("═".repeat(60));
  console.log("\n⚠️  WARNING: This will:");
  console.log("   1. DROP all tables and enums in staging");
  console.log("   2. Recreate schema via migrations");
  console.log("   3. Import data from:", jsonFilePath);
  console.log("\n   This operation is IRREVERSIBLE!\n");

  try {
    const startTime = Date.now();

    // Step 1: Drop all tables
    await dropAllTables();

    // Step 2: Run migrations
    await runMigrations();

    // Step 3: Import data
    await importData(jsonFilePath);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\n" + "═".repeat(60));
    console.log(`  ✅ IMPORT COMPLETED SUCCESSFULLY IN ${duration}s`);
    console.log("═".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n" + "═".repeat(60));
    console.error("  ❌ IMPORT FAILED");
    console.error("═".repeat(60));
    console.error("\n💥 Error:", error.message);
    console.error("\n⚠️  Staging database may be in an inconsistent state!");
    console.error(
      "   Consider running migrations manually: pnpm migrate:up:staging\n",
    );
    process.exit(1);
  }
}

// Run the import
main();
