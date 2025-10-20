const WEIGHT_SCORE = {
  type: "number",
  min: -100,
  max: 200,
  default: 0,
} as const;

const countryCodes = [
  { code: "+972", emoji: "🇮🇱", country: "Israel" },
] as const;

const SET_NUMBER = {
  type: "number",
  min: 1,
  max: 10,
  default: 1,
} as const;

const COMMENT_LENGTH = {
  min: 0,
  max: 280,
} as const;

const REPETITIONS = {
  type: "number",
  min: 1,
  max: 100,
  default: 1,
} as const;

const TIME_SCORE = {
  type: "number",
  min: 0,
  max: null,
  default: 0,
} as const;

const RPE_SCORE = {
  type: "number",
  min: 1,
  max: 10,
  default: 1,
} as const;

const RIR_SCORE = {
  type: "number",
  min: 0,
  max: 10,
  default: 1,
} as const;

export {
  WEIGHT_SCORE,
  SET_NUMBER,
  REPETITIONS,
  TIME_SCORE,
  RPE_SCORE,
  RIR_SCORE,
  COMMENT_LENGTH,
  countryCodes,
};
