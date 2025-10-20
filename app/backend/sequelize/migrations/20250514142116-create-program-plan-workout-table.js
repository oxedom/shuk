"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("program_plan_workouts", {
      program_plan_workout_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      english_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      hebrew_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      program_plan_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "program_plans",
          key: "program_plan_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("program_plan_workouts");
  },
};
