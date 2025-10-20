# i18n Dictionary Synchronization Tool

A powerful Node.js script that synchronizes internationalization (i18n) dictionary files by ensuring all translation files have the same key structure and ordering.

## Features

- **Missing Key Detection**: Automatically identifies keys that exist in one file but not in others
- **Missing Key Addition**: Adds missing keys with `MISSING-KEY-{index}` placeholder values
- **Structure Preservation**: Maintains identical key ordering and nested object structures across all files
- **Nested Object Support**: Handles both flat string keys and deeply nested object structures
- **Data Safety**: Never removes existing keys or values from any file
- **Backup Creation**: Creates `.backup` files before making changes
- **Comprehensive Logging**: Detailed console output showing all changes made

## Usage

### Basic Usage

```bash
# Run from project root
node scripts/i18n-sync.js

# Or make it executable and run directly
chmod +x scripts/i18n-sync.js
./scripts/i18n-sync.js
```

### Custom Directory

```bash
# Specify a custom dictionary directory
node scripts/i18n-sync.js path/to/custom/dictionarys
```

## How It Works

1. **Discovery**: Scans the `app/i18n/dictionarys/` directory for JSON files (excluding `debug.json`)
2. **Master Structure**: Builds a comprehensive key structure from all source files combined
3. **Synchronization**: Updates each file to match the master structure while preserving existing values
4. **Missing Keys**: Adds placeholder values in the format `MISSING-KEY-{index}` for missing keys
5. **Ordering**: Ensures all files have identical key ordering for easy comparison and maintenance

## File Processing

- **Source Files**: All `.json` files in the dictionary directory except `debug.json`
- **Backup Files**: Original files are backed up with `.backup` extension
- **Output Format**: JSON files are formatted with 2-space indentation for readability

## Example Output

```
🚀 Starting i18n Dictionary Synchronization...

📁 Discovering source files...
   Found 2 source files: en.json, he.json

🔧 Building master key structure...
   Reading: en.json
   Reading: he.json
   Master structure built with 519 total keys

🔄 Synchronizing files...
   Processing: en.json
     Added missing key: Common.newKey = "MISSING-KEY-1"
     Created backup: en.json.backup
     Updated: en.json
   Processing: he.json
     Added missing key: Components.Dialog.title = "MISSING-KEY-2"
     Created backup: he.json.backup
     Updated: he.json

✅ Synchronization completed successfully!

📊 Synchronization Summary:
   Source files processed: 2
   Total missing keys added: 2
   Master structure keys: 519
```

## Safety Features

- **Backup Creation**: Original files are always backed up before changes
- **Value Preservation**: Existing translation values are never modified or removed
- **Error Handling**: Comprehensive error handling with clear error messages
- **Validation**: JSON parsing validation ensures file integrity

## Best Practices

1. **Run Regularly**: Execute after adding new translation keys to any file
2. **Review Changes**: Check the console output to understand what keys were added
3. **Update Placeholders**: Replace `MISSING-KEY-{index}` values with actual translations
4. **Version Control**: Commit changes after running to track synchronization history

## Integration

This script can be easily integrated into:

- Build processes
- Pre-commit hooks
- CI/CD pipelines
- Development workflows

## Troubleshooting

- **Permission Errors**: Ensure the script has read/write permissions to the dictionary directory
- **JSON Syntax Errors**: Fix any JSON syntax errors in source files before running
- **Missing Directory**: Verify the dictionary path exists and contains JSON files

## Requirements

- Node.js (any recent version)
- Read/write access to the dictionary files
- Valid JSON syntax in all source files
