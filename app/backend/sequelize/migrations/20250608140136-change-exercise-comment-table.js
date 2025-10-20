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
    await queryInterface.changeColumn("exercise_comments", "comment", {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        len: [COMMENT_LENGTH.min, COMMENT_LENGTH.max],
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("exercise_comments", "comment", {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        len: [COMMENT_LENGTH.min, COMMENT_LENGTH.max],
      },
    });
  },
};
