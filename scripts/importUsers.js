#!/usr/bin/env node

const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const csvParser = require("csv-parser");
const { Sequelize, DataTypes } = require("sequelize");

// Get environment from command line argument or default to development
const env = process.argv[2] || "development";
const envFile = `./.env.${env}`;

console.log(`🚀 User Import Script - ${env.toUpperCase()} Environment`);

if (env === "production") {
  throw new Error("Importing users to production is not allowed");
  return;
  console.log("⚠️  WARNING: You are about to import users to PRODUCTION!");
}

// Load environment configuration
const envConfig = dotenv.config({ path: envFile });

if (envConfig.error) {
  console.error(
    `❌ Error loading environment from ${envFile}:`,
    envConfig.error,
  );
  process.exit(1);
}

const postgresUrl = envConfig.parsed.POSTGRES_URL;

if (!postgresUrl) {
  console.error(`❌ POSTGRES_URL not found in ${envFile}`);
  process.exit(1);
}

// Initialize Sequelize
const sequelize = new Sequelize(postgresUrl, {
  logging: false, // Set to console.log to see SQL queries
});

// Define User model (simplified version for import)
const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    gender: {
      type: DataTypes.ENUM("MALE", "FEMALE", "OTHER"),
      defaultValue: "OTHER",
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isE164(value) {
          if (value && !/^\+[1-9]\d{1,14}$/.test(value)) {
            throw new Error("Phone number must be in E.164 format");
          }
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    birthday: {
      type: DataTypes.DATE,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    is_coach: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    is_trainee: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: true,
    },
    is_gym_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    is_super_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    gym_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  },
);

// Function to prompt for input
function promptInput(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Function to prompt for password (for non-dev environments)
async function checkPasswordProtection() {
  if (env !== "development") {
    console.log(
      `🚨 WARNING: Importing users to ${env.toUpperCase()} environment!`,
    );
    const password = await promptInput("Enter password to continue: ");

    if (password !== "123") {
      console.error("❌ Incorrect password. Access denied.");
      process.exit(1);
    }

    console.log("✅ Password correct. Proceeding...");
  }
}

// Function to read and parse CSV file
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const users = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        users.push({
          first_name: row.first_name.trim(),
          last_name: row.last_name.trim(),
          gender: row.gender.trim(),
          email: row.email.trim().toLowerCase(),
          phone: row.phone.trim(),
        });
      })
      .on("end", () => {
        resolve(users);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

// Function to validate gym_id exists
async function validateGymId(gymId) {
  try {
    const result = await sequelize.query(
      "SELECT gym_id, english_name FROM gyms WHERE gym_id = :gymId",
      {
        replacements: { gymId },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    if (result.length === 0) {
      throw new Error(`Gym with ID ${gymId} does not exist`);
    }

    return result[0];
  } catch (error) {
    throw error;
  }
}

// Function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to check if email is Gmail
function isGmailEmail(email) {
  return email.toLowerCase().endsWith("@gmail.com");
}

// Function to filter and export excluded users
async function filterAndExportUsers(users) {
  const validGmailUsers = [];
  const excludedUsers = [];

  for (const user of users) {
    const email = user.email.trim().toLowerCase();

    if (!isValidEmail(email)) {
      excludedUsers.push({
        ...user,
        reason: "invalid-email-format",
      });
    } else if (!isGmailEmail(email)) {
      excludedUsers.push({
        ...user,
        reason: "non-gmail",
      });
    } else {
      validGmailUsers.push(user);
    }
  }

  // Export excluded users to CSV
  if (excludedUsers.length > 0) {
    const csvPath = path.join(
      process.cwd(),
      "data",
      "excluded_non_gmail_users.csv",
    );
    const csvHeader = "first_name,last_name,gender,email,phone,reason\n";
    const csvContent = excludedUsers
      .map(
        (user) =>
          `${user.first_name},${user.last_name},${user.gender},${user.email},${user.phone},${user.reason}`,
      )
      .join("\n");

    fs.writeFileSync(csvPath, csvHeader + csvContent);
    console.log(
      `📄 Excluded ${excludedUsers.length} non-Gmail users exported to: ${csvPath}`,
    );
  }

  return { validGmailUsers, excludedUsers };
}

// Function to import users
async function importUsers(users, gymId) {
  // Filter users and export excluded ones
  const { validGmailUsers, excludedUsers } = await filterAndExportUsers(users);

  console.log(`\n📊 Processing ${users.length} total users...`);
  console.log(`✅ Valid Gmail users: ${validGmailUsers.length}`);
  console.log(`❌ Excluded users: ${excludedUsers.length}`);

  if (validGmailUsers.length === 0) {
    console.log("❌ No valid Gmail users to import!");
    return { successCount: 0, errorCount: excludedUsers.length, errors: [] };
  }

  console.log(`\n📊 Importing ${validGmailUsers.length} Gmail users...`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < validGmailUsers.length; i++) {
    const user = validGmailUsers[i];
    try {
      // Check if user already exists by email or phone
      const existingUser = await User.findOne({
        where: {
          [Sequelize.Op.or]: [{ email: user.email }, { phone: user.phone }],
        },
      });

      if (existingUser) {
        console.log(
          `⚠️  User already exists: ${user.first_name} ${user.last_name} (${user.email})`,
        );
        errorCount++;
        errors.push(`User already exists: ${user.email}`);
        continue;
      }

      // Create new user with gym_id
      await User.create({
        ...user,
        gym_id: gymId,
        is_trainee: true,
        is_coach: false,
        is_gym_admin: false,
        is_super_admin: false,
        is_active: true,
      });

      successCount++;
      console.log(`✅ Created user: ${user.first_name} ${user.last_name}`);
    } catch (error) {
      errorCount++;
      const errorMsg = `Error creating ${user.first_name} ${user.last_name}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  console.log(`\n📈 Import Summary:`);
  console.log(`✅ Successfully imported: ${successCount} users`);
  console.log(`❌ Import errors: ${errorCount}`);
  console.log(`📄 Non-Gmail users excluded: ${excludedUsers.length}`);

  if (errors.length > 0) {
    console.log(`\n📝 Error Details:`);
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  return { successCount, errorCount, errors };
}

// Main execution
async function main() {
  try {
    // Check password protection
    await checkPasswordProtection();

    // Connect to database
    console.log(`\n🔌 Connecting to PostgreSQL (${env} environment)...`);
    await sequelize.authenticate();
    console.log("✅ Database connection established.");

    // Prompt for gym_id
    const gymIdInput = await promptInput(
      `\n🏋️ Enter gym ID to assign users to: `,
    );
    const gymId = parseInt(gymIdInput);

    if (isNaN(gymId)) {
      console.error("❌ Invalid gym ID. Please enter a number.");
      process.exit(1);
    }

    // Validate gym exists
    const gym = await validateGymId(gymId);
    console.log(`✅ Selected gym: ${gym.english_name} (ID: ${gym.gym_id})`);

    // Confirm before proceeding
    const confirm = await promptInput(
      `\n⚠️  Are you sure you want to import users to gym ID ${gymId} in ${env.toUpperCase()}? (yes/no): `,
    );
    if (confirm.toLowerCase() !== "yes") {
      console.log("❌ Import cancelled.");
      process.exit(0);
    }

    // Read CSV file
    const csvPath = path.join(process.cwd(), "data", "users_import.csv");
    console.log(`\n📖 Reading CSV file: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV file not found: ${csvPath}`);
      process.exit(1);
    }

    const users = await readCSV(csvPath);
    console.log(`✅ Parsed ${users.length} users from CSV`);

    // Import users
    await importUsers(users, gymId);

    console.log(`\n🎉 Import completed!`);
  } catch (error) {
    console.error(`❌ Fatal error:`, error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log("🔌 Database connection closed.");
  }
}

// Run the script
main();
