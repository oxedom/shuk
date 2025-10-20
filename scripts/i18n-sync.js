#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * i18n Dictionary Synchronization Tool
 *
 * This script synchronizes internationalization dictionary files by:
 * 1. Building a master key structure from all source files
 * 2. Adding missing keys with MISSING-KEY-{index} values
 * 3. Preserving identical key ordering across all files
 * 4. Supporting nested object structures
 * 5. Never removing existing keys or values
 */

class I18nSynchronizer {
  constructor(dictionaryPath = "./app/i18n/dictionarys") {
    this.dictionaryPath = path.resolve(dictionaryPath);
    this.missingKeyCounter = 1;
    this.sourceFiles = [];
    this.masterStructure = {};
  }

  /**
   * Main synchronization method
   */
  async synchronize() {
    console.log("🚀 Starting i18n Dictionary Synchronization...\n");

    try {
      // Step 1: Discover source files
      this.discoverSourceFiles();

      // Step 2: Build master structure
      this.buildMasterStructure();

      // Step 3: Synchronize all files
      this.synchronizeFiles();

      console.log("✅ Synchronization completed successfully!\n");
      this.printSummary();
    } catch (error) {
      console.error("❌ Synchronization failed:", error.message);
      process.exit(1);
    }
  }

  /**
   * Discover all JSON files in the directory (excluding debug.json)
   */
  discoverSourceFiles() {
    console.log("📁 Discovering source files...");

    if (!fs.existsSync(this.dictionaryPath)) {
      throw new Error(`Dictionary path does not exist: ${this.dictionaryPath}`);
    }

    const files = fs
      .readdirSync(this.dictionaryPath)
      .filter((file) => file.endsWith(".json") && file !== "debug.json")
      .map((file) => path.join(this.dictionaryPath, file));

    if (files.length === 0) {
      throw new Error("No JSON dictionary files found");
    }

    this.sourceFiles = files;
    console.log(
      `   Found ${files.length} source files:`,
      files.map((f) => path.basename(f)).join(", "),
    );
    console.log();
  }

  /**
   * Build master key structure from all source files
   */
  buildMasterStructure() {
    console.log("🔧 Building master key structure...");

    // Read all files and merge their structures
    const allStructures = [];

    for (const filePath of this.sourceFiles) {
      console.log(`   Reading: ${path.basename(filePath)}`);

      try {
        const content = fs.readFileSync(filePath, "utf8");
        const data = JSON.parse(content);
        allStructures.push(data);
      } catch (error) {
        throw new Error(`Failed to read ${filePath}: ${error.message}`);
      }
    }

    // Merge all structures to create master structure
    this.masterStructure = this.mergeStructures(allStructures);

    const totalKeys = this.countKeys(this.masterStructure);
    console.log(`   Master structure built with ${totalKeys} total keys`);
    console.log();
  }

  /**
   * Recursively merge multiple object structures
   */
  mergeStructures(structures) {
    const merged = {};
    const allKeys = new Set();

    // Collect all unique keys from all structures
    structures.forEach((structure) => {
      this.collectKeys(structure, allKeys, "");
    });

    // Sort keys to ensure consistent ordering
    const sortedKeys = Array.from(allKeys).sort();

    // Build merged structure with sorted keys
    for (const keyPath of sortedKeys) {
      this.setNestedValue(
        merged,
        keyPath,
        this.getValueFromAnyStructure(structures, keyPath),
      );
    }

    return merged;
  }

  /**
   * Collect all keys from a nested structure
   */
  collectKeys(obj, keySet, prefix) {
    for (const key in obj) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      keySet.add(fullPath);

      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        this.collectKeys(obj[key], keySet, fullPath);
      }
    }
  }

  /**
   * Get value for a key path from any of the structures
   */
  getValueFromAnyStructure(structures, keyPath) {
    for (const structure of structures) {
      const value = this.getNestedValue(structure, keyPath);
      if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  }

  /**
   * Get nested value using dot notation
   */
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Set nested value using dot notation
   */
  setNestedValue(obj, path, value) {
    const keys = path.split(".");
    const lastKey = keys.pop();

    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = {};
      }
      return current[key];
    }, obj);

    target[lastKey] = value;
  }

  /**
   * Synchronize all files with the master structure
   */
  synchronizeFiles() {
    console.log("🔄 Synchronizing files...");

    for (const filePath of this.sourceFiles) {
      const fileName = path.basename(filePath);
      console.log(`   Processing: ${fileName}`);

      // Read current file
      const currentContent = fs.readFileSync(filePath, "utf8");
      const currentData = JSON.parse(currentContent);

      // Create synchronized version
      const syncedData = this.synchronizeStructure(
        currentData,
        this.masterStructure,
        "",
      );

      // Write back to file with proper formatting
      const formattedJson = JSON.stringify(syncedData, null, 2);

      // Create backup
      // const backupPath = filePath + ".backup";
      // fs.writeFileSync(backupPath, currentContent);
      // console.log(`     Created backup: ${fileName}.backup`);

      // Write synchronized file
      fs.writeFileSync(filePath, formattedJson);
      console.log(`     Updated: ${fileName}`);
    }

    console.log();
  }

  /**
   * Synchronize a structure with the master structure
   */
  synchronizeStructure(current, master, prefix) {
    const result = {};

    // Process all keys from master structure in order
    for (const key in master) {
      const currentPath = prefix ? `${prefix}.${key}` : key;

      if (
        typeof master[key] === "object" &&
        master[key] !== null &&
        !Array.isArray(master[key])
      ) {
        // Handle nested objects
        const currentNested = current[key] || {};
        result[key] = this.synchronizeStructure(
          currentNested,
          master[key],
          currentPath,
        );
      } else {
        // Handle leaf values
        if (current[key] !== undefined) {
          // Preserve existing value
          result[key] = current[key];
        } else {
          // Add missing key with MISSING-KEY-{index} format
          result[key] = `MISSING-KEY-${this.missingKeyCounter++}`;
          console.log(
            `     Added missing key: ${currentPath} = "${result[key]}"`,
          );
        }
      }
    }

    return result;
  }

  /**
   * Count total number of keys in a nested structure
   */
  countKeys(obj, count = 0) {
    for (const key in obj) {
      count++;
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        count = this.countKeys(obj[key], count);
      }
    }
    return count;
  }

  /**
   * Print synchronization summary
   */
  printSummary() {
    console.log("📊 Synchronization Summary:");
    console.log(`   Source files processed: ${this.sourceFiles.length}`);
    console.log(`   Total missing keys added: ${this.missingKeyCounter - 1}`);
    console.log(
      `   Master structure keys: ${this.countKeys(this.masterStructure)}`,
    );
    console.log();
    console.log("💡 Notes:");
    console.log("   - Backup files created with .backup extension");
    console.log("   - Missing keys use format: MISSING-KEY-{index}");
    console.log("   - All existing values preserved");
    console.log("   - Key ordering synchronized across all files");
  }
}

// CLI Usage
if (require.main === module) {
  const synchronizer = new I18nSynchronizer();

  // Handle command line arguments
  const args = process.argv.slice(2);
  if (args.length > 0) {
    synchronizer.dictionaryPath = path.resolve(args[0]);
  }

  synchronizer.synchronize().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = I18nSynchronizer;
