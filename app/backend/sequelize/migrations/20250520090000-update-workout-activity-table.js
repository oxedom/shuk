"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "workout_activities",
      "program_plan_workout_exercise_id",
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "workout_activities",
      "program_plan_workout_exercise_id",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    );
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
