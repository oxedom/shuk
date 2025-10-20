"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. First add the column as nullable
    await queryInterface.addColumn("workout_instances", "user_id", {
      type: Sequelize.INTEGER,
      allowNull: true, // temporarily allow null
      references: {
        model: "users",
        key: "user_id",
      },
    });

    // 2. Set all existing records to user_id = 1
    await queryInterface.sequelize.query(
      "UPDATE workout_instances SET user_id = 1 WHERE user_id IS NULL",
    );

    // 3. Now alter the column to make it not nullable
    await queryInterface.changeColumn("workout_instances", "user_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    });

    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("workout_instances", "user_id");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
