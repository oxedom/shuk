"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("program_plan_workout_exercises", {
      program_plan_workout_exercise_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      program_plan_workout_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "program_plan_workouts",
          key: "program_plan_workout_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      sets: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      expected_min_reps: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      expected_max_reps: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      expected_min_kg: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      expected_max_kg: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      exercise_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "exercises",
          key: "exercise_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      position: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    await queryInterface.dropTable("program_plan_workout_exercises");
  },
};
