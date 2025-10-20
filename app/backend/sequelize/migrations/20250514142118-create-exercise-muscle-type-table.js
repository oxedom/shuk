"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "exercise_muscles_type",
      {
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
        muscle_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "muscles",
            key: "muscle_id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        type: {
          type: Sequelize.ENUM("PRIMARY", "SECONDARY"),
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
      },
      {
        uniqueKeys: {
          exercise_muscle_unique: {
            fields: ["exercise_id", "muscle_id"],
          },
        },
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("exercise_muscles_type");
  },
};
