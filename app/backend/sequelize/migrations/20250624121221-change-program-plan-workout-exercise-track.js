"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "program_plan_workout_exercises",
      "track_rpe_score",
      { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    );
    await queryInterface.addColumn(
      "program_plan_workout_exercises",
      "track_rir_score",
      { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "program_plan_workout_exercises",
      "track_rpe_score",
    );
    await queryInterface.removeColumn(
      "program_plan_workout_exercises",
      "track_rir_score",
    );
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
