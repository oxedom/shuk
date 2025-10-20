# Database Export/Import Scripts

These scripts allow you to safely copy all production data to staging while preserving IDs and maintaining referential integrity.

## Overview

- **Export Script**: Read-only export of all production data to JSON
- **Import Script**: Drops staging schema, recreates it via migrations, and imports data

## Prerequisites

- `.env.production` file with production database credentials
- `.env.staging` file with staging database credentials
- Both databases must be Neon PostgreSQL instances

## Usage

### Step 1: Export Production Data

```bash
# Using npm script (recommended)
pnpm export:prod

# Or directly
NODE_ENV=production node scripts/export-import/export-prod-data.js
```

This will:

- Connect to production database (READ-ONLY)
- Export all tables in dependency order
- Save to `backups/prod-data-export-{timestamp}.json`
- Display export summary

**Output example:**

```
✅ Export completed successfully!
📁 File saved to: backups/prod-data-export-1234567890.json

📊 Export Summary:
──────────────────────────────────────────────────
   gyms                                      5 rows
   users                                   150 rows
   exercises                                45 rows
   ...
──────────────────────────────────────────────────
   TOTAL                                   500 rows
```

### Step 2: Import to Staging

⚠️ **WARNING**: This operation is DESTRUCTIVE and will:

1. DROP all tables and enums in staging
2. Recreate schema via migrations
3. Import all data (preserving IDs)

```bash
# Using npm script (recommended)
pnpm import:staging backups/prod-data-export-1234567890.json

# Or directly
node scripts/export-import/import-to-staging.js backups/prod-data-export-1234567890.json
```

**Output example:**

```
═══════════════════════════════════════════════════════════
  STAGING DATABASE IMPORT - DESTRUCTIVE OPERATION
═══════════════════════════════════════════════════════════

🗑️  STEP 1: Dropping all tables and enums from staging...
   ✅ All tables and enums dropped successfully

🔧 STEP 2: Running migrations to recreate schema...
   ✅ Migrations completed successfully

📥 STEP 3: Importing data to staging...
   📊 Source: production
   📅 Export date: 2025-10-15T18:30:00.000Z

   📋 Importing gyms...
      ✓ Imported 5 rows
      ✓ Reset sequence for gyms
   ...

   ✅ Successfully imported 500 total rows

═══════════════════════════════════════════════════════════
  ✅ IMPORT COMPLETED SUCCESSFULLY IN 12.45s
═══════════════════════════════════════════════════════════
```

## Table Export/Import Order

Tables are processed in dependency order to respect foreign key constraints:

1. `gyms` - No dependencies
2. `muscles` - No dependencies
3. `users` - Depends on gyms
4. `exercises` - Depends on gyms
5. `videos` - Depends on exercises
6. `exercise_muscles_type` - Junction table
7. `program_plans` - Depends on users
8. `program_plan_workouts` - Depends on program_plans
9. `program_plan_workout_exercises` - Depends on program_plan_workouts, exercises
10. `workout_instances` - Depends on users, program_plan_workouts
11. `workout_activities` - Depends on workout_instances, exercises
12. `exercise_comments` - Depends on exercises, program_plan_workouts
13. `workout_comments` - Depends on program_plan_workouts

## Key Features

### Export Script (`export-prod-data.js`)

- ✅ Read-only connection (no risk to production)
- ✅ Uses direct `pg` client (no Sequelize overhead)
- ✅ Exports data in correct dependency order
- ✅ Includes metadata (timestamp, row counts)
- ✅ Comprehensive error handling
- ✅ Progress logging

### Import Script (`import-to-staging.js`)

- ✅ Full schema recreation (drop → migrate → import)
- ✅ Preserves production IDs exactly
- ✅ Resets PostgreSQL sequences after import
- ✅ Uses raw SQL INSERT queries (no model dependencies)
- ✅ Schema-aware: only imports columns that exist in target table
- ✅ Handles schema differences between production and staging gracefully
- ✅ Batch processing for performance (100 rows per batch)
- ✅ Detailed progress logging with warnings for skipped columns
- ✅ Error recovery guidance

## ID Preservation

The import script preserves exact IDs from production using raw SQL INSERT statements:

```javascript
// Direct INSERT with all columns including ID columns
INSERT INTO table_name (column1, column2, id_column, ...)
VALUES ($1, $2, $3, ...)
```

This approach:

- Works without TypeScript model compilation
- Preserves all IDs exactly as they are in production
- Uses batched inserts (100 rows at a time) for performance
- After import, sequences are automatically reset to `max(id) + 1` for each table

## Schema Differences Handling

The import script is **schema-aware** and handles differences between production and staging:

**How it works:**

1. Before importing each table, queries the staging database for existing columns
2. Filters export data to only include columns that exist in staging
3. Warns you about any columns being skipped
4. Safely imports data without breaking on schema mismatches

**Example output:**

```
📋 Importing program_plan_workout_exercises...
   ⚠️  Skipping columns not in target: track_weight_score, old_column
   ✓ Imported 245 rows
```

This means you can safely import production data even if:

- Production has newer columns that staging doesn't have yet
- Column names were changed in migrations
- Fields were removed from the schema

**Important:** Only columns present in BOTH production export AND staging schema will be imported.

## Error Handling

### Export Errors

- Connection failures → Check `.env.production`
- Missing tables → Verify table names match schema
- Permission errors → Ensure read access to production

### Import Errors

- Migration failures → Manually run `pnpm migrate:up:staging`
- Data validation errors → Check JSON file integrity
- Sequence errors → Manually reset with provided SQL

## Troubleshooting

### Import fails during data insertion

If the import fails partway through, staging may be in an inconsistent state:

```bash
# Option 1: Run the full import again (it will drop/recreate)
pnpm import:staging backups/prod-data-export-1234567890.json

# Option 2: Manually fix and run migrations
pnpm migrate:up:staging
```

### Sequence not reset properly

Manually reset a sequence:

```sql
SELECT setval('table_name_id_column_seq', (SELECT MAX(id_column) FROM table_name), true);
```

### Check what data was imported

```bash
# Connect to staging
pnpm psql:staging

# Check row counts
SELECT 'gyms' as table, COUNT(*) FROM gyms
UNION ALL
SELECT 'users', COUNT(*) FROM users
-- etc...
```

## Safety Features

1. **Read-only export**: Production is never modified
2. **Explicit file path**: Import requires explicit JSON file argument
3. **Warning messages**: Clear warnings before destructive operations
4. **Error messages**: Detailed error reporting with recovery steps
5. **Validation**: JSON structure validation before import

## Complete Workflow Example

```bash
# 1. Export from production
pnpm export:prod
# Output: backups/prod-data-export-1697472000000.json

# 2. Import to staging (using the exact filename from step 1)
pnpm import:staging backups/prod-data-export-1697472000000.json

# 3. Verify in staging
pnpm psql:staging
# Run queries to verify data
```

## Files

- `export-prod-data.js` - Export script (uses pg client)
- `import-to-staging.js` - Import script (uses drop.sql + migrations + Sequelize)
- `README.md` - This documentation
- `../../psql-commands/drop.sql` - SQL to drop all tables/enums

## Related Scripts

- `scripts/syncWithProd.js` - Alternative using pg_dump/pg_restore
- `scripts/syncStagingToDev.js` - Sync staging to development
- `scripts/backup-db.sh` - Database backup script
