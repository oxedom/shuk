"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("program_plan_workouts", "position", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("program_plan_workouts", "position");
  },
};
