// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {
//     await queryInterface.createTable('workout_templates', {
//       workout_template_id: {
//         type: Sequelize.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       english_name: {
//         type: Sequelize.STRING,
//         allowNull: false,
//       },
//       hebrew_name: {
//         type: Sequelize.STRING,
//       },
//       expected_amount_of_workouts: {
//         type: Sequelize.INTEGER,
//         allowNull: true,
//       },
//       program_template_id: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         references: {
//           model: 'program_templates',
//           key: 'program_template_id'
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
//     await queryInterface.dropTable('workout_templates');
//   }
// };
