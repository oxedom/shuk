const env = process.env.NODE_ENV;
require("dotenv").config({ path: `./.env.${env}` });

const dialect = "postgres";

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect,
  },
  staging: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect,
    dialectOptions: {
      ssl: {
        require: true,
      },
    },
  },
  //Needs explicit uncomment
  // production: {
  //   username: process.env.DB_USERNAME,
  //   password: process.env.DB_PASSWORD,
  //   database: process.env.DB_DATABASE,
  //   host: process.env.DB_HOST,
  //   dialect,
  //   dialectOptions: {
  //     ssl: {
  //       require: true,
  //     },
  //   },
  // },
};
