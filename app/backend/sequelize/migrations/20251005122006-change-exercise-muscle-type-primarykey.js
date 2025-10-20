"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the primary key column
    await queryInterface.addColumn(
      "exercise_muscles_type",
      "exercise_muscle_type_id",
      {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
    );

    // Populate existing rows with sequential IDs
    const [results] = await queryInterface.sequelize.query(
      "SELECT exercise_id, muscle_id FROM exercise_muscles_type ORDER BY exercise_id, muscle_id",
    );

    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      await queryInterface.sequelize.query(
        "UPDATE exercise_muscles_type SET exercise_muscle_type_id = ? WHERE exercise_id = ? AND muscle_id = ?",
        {
          replacements: [i + 1, row.exercise_id, row.muscle_id],
        },
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove the primary key column
    await queryInterface.removeColumn(
      "exercise_muscles_type",
      "exercise_muscle_type_id",
    );
  },
};
