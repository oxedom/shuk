"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("workout_activities", "exercise_position", {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
      },
    });

    await queryInterface.changeColumn("workout_activities", "repetitions", {
      type: Sequelize.DECIMAL,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "workout_activities",
      "exercise_position",
    );
    await queryInterface.changeColumn("workout_activities", "repetitions", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
