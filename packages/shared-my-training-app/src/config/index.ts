export const DEFAULT_CONFIG = {
  API_BASE_URL: process.env.API_BASE_URL || "http://localhost:3000",
  DB_CONNECTION_TIMEOUT: 5000,
  MAX_RETRIES: 3,
} as const;

export type Config = typeof DEFAULT_CONFIG;
