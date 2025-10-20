"use strict";

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    const exercises = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(
        path.join(
          process.cwd(),
          "app/backend/sequelize/seeders/csv/temp/exercises.csv",
        ),
      )
        .pipe(csv())
        .on("data", (row) => exercises.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    const exercisesJson = exercises
      .map((exercise) => {
        if (
          !exercise.english_name ||
          !exercise.hebrew_name ||
          !exercise.tracking_unit
        ) {
          return null;
        }

        const exerciseData = {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        exerciseData.english_name = exercise.english_name;
        exerciseData.hebrew_name = exercise.hebrew_name;

        exerciseData.type = exercise.tracking_unit;

        return exerciseData;
      })
      .filter((exercise) => exercise !== null);

    await queryInterface.bulkInsert("exercises", exercisesJson);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("exercises", null, {});
  },
};
