const WEIGHT_SCORE = {
  type: "number",
  min: -100,
  max: 200,
  default: 0,
};

const SET_NUMBER = {
  type: "number",
  min: 1,
  max: 10,
  default: 1,
};

const COMMENT_LENGTH = {
  min: 0,
  max: 280,
};

const REPETITIONS = {
  type: "number",
  min: 1,
  max: 100,
  default: 1,
};

const TIME_SCORE = {
  type: "number",
  min: 0,
  max: null,
  default: 0,
};

const RPE_SCORE = {
  type: "number",
  min: 1,
  max: 10,
  default: 1,
};

const RIR_SCORE = {
  type: "number",
  min: 0,
  max: 10,
  default: 1,
};

module.exports = {
  WEIGHT_SCORE,
  SET_NUMBER,
  REPETITIONS,
  TIME_SCORE,
  RPE_SCORE,
  RIR_SCORE,
  COMMENT_LENGTH,
};
