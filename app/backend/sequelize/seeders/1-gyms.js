"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    if (process.env.APP_ENV === "test") {
      return;
    }
    const gyms = [
      {
        english_name: "Guy Vaserman Studio",
        hebrew_name: "גיא וסרמן סטודיו",
        is_active: true,
        primary_color: "#EA580C",
        primary_color_foreground: "#FFFFFF",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        english_name: "Yoel's Gym",
        hebrew_name: "המכון של יואל",
        is_active: true,
        primary_color: "#000000",
        primary_color_foreground: "#FFFFFF",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await queryInterface.bulkInsert("gyms", gyms);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("gyms", null, {});
  },
};
