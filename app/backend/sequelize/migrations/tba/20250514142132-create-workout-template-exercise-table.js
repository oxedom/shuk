// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {
//     await queryInterface.createTable('workout_template_exercises', {
//       workout_template_exercise_id: {
//         type: Sequelize.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       position: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         defaultValue: 0,
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
//       exercise_id: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         references: {
//           model: 'exercises',
//           key: 'exercise_id'
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

//     // Add an index for better performance
//     await queryInterface.addIndex('workout_template_exercises', ['workout_template_id'], {
//       name: 'workout_template_exercises_template_idx'
//     });
//   },

//   async down (queryInterface, Sequelize) {
//     await queryInterface.dropTable('workout_template_exercises');
//   }
// };
