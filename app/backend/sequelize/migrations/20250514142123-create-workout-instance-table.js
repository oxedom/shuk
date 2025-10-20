"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("workout_instances", {
      workout_instance_id: {
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
      start_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      workout_type: {
        type: Sequelize.ENUM("MULTI", "SINGLE"),
        allowNull: false,
      },
      workout_status: {
        type: Sequelize.ENUM("IN_PROGRESS", "COMPLETED", "TERMINATED"),
        defaultValue: "IN_PROGRESS",
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
    await queryInterface.dropTable("workout_instances");
  },
};
