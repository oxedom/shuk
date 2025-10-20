# Quick Start Guide: Production → Staging Data Copy

## TL;DR

```bash
# Step 1: Export production data (read-only, safe)
pnpm export:prod

# Step 2: Copy the filename from output, then import to staging (DESTRUCTIVE!)
pnpm import:staging backups/prod-data-export-{timestamp}.json
```

## What This Does

### Export (`pnpm export:prod`)

- ✅ Connects to production database (READ-ONLY)
- ✅ Exports all tables to JSON in correct order
- ✅ Saves to `backups/` directory
- ⏱️ Takes ~30 seconds for typical database

### Import (`pnpm import:staging <file>`)

- ⚠️ **DESTRUCTIVE**: Drops everything in staging
- 🔧 Recreates schema via migrations
- 📥 Imports all data preserving exact IDs
- 🔄 Resets sequences for auto-increment
- ⏱️ Takes ~1-2 minutes for typical database

## Example Output

```bash
$ pnpm export:prod

🔌 Connecting to production database (READ-ONLY)...
✅ Connected successfully

📊 Exporting table: gyms...
   ✓ Exported 3 rows from gyms
📊 Exporting table: users...
   ✓ Exported 125 rows from users
...

✅ Export completed successfully!
📁 File saved to: backups/prod-data-export-1697472000000.json

✨ Success! Use this file for import:
   node scripts/export-import/import-to-staging.js backups/prod-data-export-1697472000000.json
```

```bash
$ pnpm import:staging backups/prod-data-export-1697472000000.json

═══════════════════════════════════════════════════════════
  STAGING DATABASE IMPORT - DESTRUCTIVE OPERATION
═══════════════════════════════════════════════════════════

⚠️  WARNING: This will:
   1. DROP all tables and enums in staging
   2. Recreate schema via migrations
   3. Import data from: backups/prod-data-export-1697472000000.json

🗑️  STEP 1: Dropping all tables and enums from staging...
   ✅ All tables and enums dropped successfully

🔧 STEP 2: Running migrations to recreate schema...
   ✅ Migrations completed successfully

📥 STEP 3: Importing data to staging...
   ✅ Successfully imported 500 total rows

═══════════════════════════════════════════════════════════
  ✅ IMPORT COMPLETED SUCCESSFULLY IN 45.23s
═══════════════════════════════════════════════════════════
```

## Safety Checklist

Before running import:

- [ ] Verify you have `.env.staging` configured
- [ ] Confirm staging database is the target (not production!)
- [ ] Understand this will DELETE all staging data
- [ ] Have the export JSON file ready
- [ ] Optional: Backup staging first

## Troubleshooting

**Export fails with "connection timeout"**
→ Check `.env.production` has correct `POSTGRES_URL`

**Import fails with "migration error"**
→ Run `pnpm migrate:up:staging` manually

**Import fails with "JSON file not found"**
→ Use absolute path or verify file exists: `ls -la backups/`

**Data imported but queries fail**
→ Sequences may need manual reset (see full README)

## More Info

See [README.md](./README.md) for complete documentation including:

- Detailed error handling
- Table dependency order
- Manual troubleshooting steps
- Architecture details
