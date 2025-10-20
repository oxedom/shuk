"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("exercises", {
      exercise_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      english_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gym_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: "gyms",
          key: "gym_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      hebrew_name: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.ENUM("TIME_WEIGHT", "WEIGHT", "TIME"),
        allowNull: false,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
    await queryInterface.dropTable("exercises");
  },
};
