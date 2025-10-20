"use strict";

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    const muscles = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(
        path.join(
          process.cwd(),
          "app/backend/sequelize/seeders/csv/temp/muscles.csv",
        ),
      )
        .pipe(csv())
        .on("data", (row) => muscles.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    const musclesJson = muscles.map((muscle) => ({
      ...muscle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    await queryInterface.bulkInsert("muscles", musclesJson);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("muscles", null, {});
  },
};
