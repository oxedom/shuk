"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {},

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("program_plan_workout_exercises", null, {});
  },
};
