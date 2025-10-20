// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {
//     await queryInterface.createTable('program_templates_workout_templates', {
//       program_template_workout_template_id: {
//         type: Sequelize.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
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
//       workout_template_id: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         references: {
//           model: 'workout_templates',
//           key: 'workout_template_id'
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

//     // Add a unique constraint to prevent duplicate associations
//     await queryInterface.addIndex('program_templates_workout_templates', ['program_template_id', 'workout_template_id'], {
//       unique: true,
//       name: 'program_workout_template_unique_idx'
//     });
//   },

//   async down (queryInterface, Sequelize) {
//     await queryInterface.dropTable('program_templates_workout_templates');
//   }
// };
