"use strict";

const path = require("path");
const blRulesPath = path.join(
  process.cwd(),
  "app/shared/business-rules-commonjs.js",
);
const { COMMENT_LENGTH } = require(blRulesPath);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("workout_comments", "comment", {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        len: [COMMENT_LENGTH.min, COMMENT_LENGTH.max],
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
    await queryInterface.changeColumn("workout_comments", "comment", {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        len: [COMMENT_LENGTH.min, COMMENT_LENGTH.max],
      },
    });

    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
