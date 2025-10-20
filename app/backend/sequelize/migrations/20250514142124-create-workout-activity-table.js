"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("workout_activities", {
      activity_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      workout_instance_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "workout_instances",
          key: "workout_instance_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      program_plan_workout_exercise_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "program_plan_workout_exercises",
          key: "program_plan_workout_exercise_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      weight_score: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      time_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      rpe_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      rir_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      set_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      repetitions: {
        type: Sequelize.DECIMAL,
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

    // Add indexes for better performance
    await queryInterface.addIndex(
      "workout_activities",
      ["exercise_id", "workout_instance_id"],
      {
        name: "workout_activity_exercise_instance_idx",
      },
    );
    await queryInterface.addIndex(
      "workout_activities",
      ["workout_instance_id"],
      {
        name: "workout_activity_instance_idx",
      },
    );
    await queryInterface.addIndex(
      "workout_activities",
      ["program_plan_workout_exercise_id"],
      {
        name: "workout_activity_program_plan_workout_exercise_idx",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("workout_activities");
  },
};
