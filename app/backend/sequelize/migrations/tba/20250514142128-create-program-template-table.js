// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {
//     await queryInterface.createTable('program_templates', {
//       program_template_id: {
//         type: Sequelize.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       gym_id: {
//         type: Sequelize.INTEGER,
//         allowNull: true,
//         references: {
//           model: 'gyms',
//           key: 'gym_id'
//         },
//         onUpdate: 'CASCADE',
//         onDelete: 'SET NULL',
//       },
//       english_name: {
//         type: Sequelize.STRING,
//         allowNull: false,
//         unique: true,
//       },
//       hebrew_name: {
//         type: Sequelize.STRING,
//         allowNull: false,
//         unique: true,
//       },
//       created_by: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         references: {
//           model: 'users',
//           key: 'user_id'
//         },
//         onUpdate: 'CASCADE',
//         onDelete: 'CASCADE',
//       },
//       createdAt: {
//         type: Sequelize.DATE,
//         allowNull: false,
//       },
//       updatedAt: {
//         type: Sequelize.DATE,
//         allowNull: false,
//       }
//     });
//   },

//   async down (queryInterface, Sequelize) {
//     await queryInterface.dropTable('program_templates');
//   }
// };
