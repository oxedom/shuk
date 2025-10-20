import pg from "pg";

import { Sequelize } from "sequelize";

const POSTGRES_URL: string = process.env.POSTGRES_URL || "";

//@ts-ignore
Sequelize.postgres.DECIMAL.parse = function (value: string) {
  return value === null ? null : parseFloat(value);
};

const sequelize = new Sequelize(POSTGRES_URL, {
  dialectModule: pg,
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  retry: {
    max: 3,
  },
});

export { sequelize };
