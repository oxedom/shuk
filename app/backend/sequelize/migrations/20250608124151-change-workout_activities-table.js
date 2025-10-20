"use strict";

const path = require("path");
const blRulesPath = path.join(
  process.cwd(),
  "app/shared/business-rules-commonjs.js",
);
const {
  WEIGHT_SCORE,
  TIME_SCORE,
  RPE_SCORE,
  RIR_SCORE,
  REPETITIONS,
  SET_NUMBER,
} = require(blRulesPath);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the CHECK constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE "workout_activities"
      ADD CONSTRAINT "chk_weight_score_range"
      CHECK (weight_score IS NULL OR (weight_score >= ${WEIGHT_SCORE.min} AND weight_score <= ${WEIGHT_SCORE.max}))
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "workout_activities"
      ADD CONSTRAINT "chk_time_score_range"
      CHECK (time_score IS NULL OR time_score >= ${TIME_SCORE.min})
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "workout_activities"
      ADD CONSTRAINT "chk_rpe_score_range"
      CHECK (rpe_score IS NULL OR (rpe_score >= ${RPE_SCORE.min} AND rpe_score <= ${RPE_SCORE.max}))
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "workout_activities"
      ADD CONSTRAINT "chk_rir_score_range"
      CHECK (rir_score IS NULL OR (rir_score >= ${RIR_SCORE.min} AND rir_score <= ${RIR_SCORE.max}))
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "workout_activities"
      ADD CONSTRAINT "chk_set_number_range"
      CHECK (set_number >= ${SET_NUMBER.min} AND set_number <= ${SET_NUMBER.max})
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "workout_activities"
      ADD CONSTRAINT "chk_repetitions_range"
      CHECK (repetitions >= ${REPETITIONS.min} AND repetitions <= ${REPETITIONS.max})
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop the constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE "workout_activities"
      DROP CONSTRAINT IF EXISTS "chk_weight_score_range"
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "workout_activities"
      DROP CONSTRAINT IF EXISTS "chk_time_score_range"
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "workout_activities"
      DROP CONSTRAINT IF EXISTS "chk_rpe_score_range"
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "workout_activities"
      DROP CONSTRAINT IF EXISTS "chk_rir_score_range"
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "workout_activities"
      DROP CONSTRAINT IF EXISTS "chk_set_number_range"
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "workout_activities"
      DROP CONSTRAINT IF EXISTS "chk_repetitions_range"
    `);
  },
};
