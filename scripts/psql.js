#!/usr/bin/env node

const dotenv = require("dotenv");
const { spawn } = require("node:child_process");
const readline = require("node:readline");

// Get environment from command line argument or default to development
const env = process.argv[2] || "development";
const envFile = `./.env.${env}`;

if (env === "production") {
  console.error("Production environment is not supported");
  process.exit(1);
}

// Load environment configuration
const envConfig = dotenv.config({ path: envFile });

if (envConfig.error) {
  console.error(`Error loading environment from ${envFile}:`, envConfig.error);
  process.exit(1);
}

const postgresUrl = envConfig.parsed.POSTGRES_URL;

if (!postgresUrl) {
  console.error(`POSTGRES_URL not found in ${envFile}`);
  process.exit(1);
}

// Function to prompt for password
function promptPassword() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `⚠️  You are about to connect to ${env.toUpperCase()} database!\nEnter password to continue: `,
      (answer) => {
        rl.close();
        resolve(answer);
      },
    );
  });
}

// Check if we need password protection for non-development environments
async function checkPasswordProtection() {
  if (env !== "development") {
    console.log(`🚨 WARNING: Connecting to ${env.toUpperCase()} environment!`);
    const password = await promptPassword();

    if (password !== "123") {
      console.error("❌ Incorrect password. Access denied.");
      process.exit(1);
    }

    console.log("✅ Password correct. Proceeding...");
  }

  console.log(`Connecting to PostgreSQL (${env} environment)...`);
}

// Main execution
checkPasswordProtection()
  .then(() => {
    // Spawn psql process with inherited stdio
    const psql = spawn("psql", [postgresUrl], {
      stdio: "inherit", // This will connect the parent's stdin, stdout, and stderr to the child
    });

    psql.on("error", (error) => {
      console.error("Failed to start psql:", error.message);
      process.exit(1);
    });

    psql.on("exit", (code, signal) => {
      if (code !== 0) {
        console.error(
          `psql exited with code ${code}${signal ? ` (${signal})` : ""}`,
        );
        process.exit(code || 1);
      }
      process.exit(0);
    });
  })
  .catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });
