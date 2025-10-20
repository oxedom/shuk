"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "program_plan_workout_exercises",
      "expected_min_reps",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "program_plan_workout_exercises",
      "expected_min_reps",
      {
        allowNull: false,
      },
    );
  },
};
