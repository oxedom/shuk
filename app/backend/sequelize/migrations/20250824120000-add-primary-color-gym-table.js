"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("gyms", "primary_color", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "#EA580C",
    });
    await queryInterface.addColumn("gyms", "primary_color_foreground", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "#FFFFFF",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("gyms", "primary_color");
    await queryInterface.removeColumn("gyms", "primary_color_foreground");
  },
};
