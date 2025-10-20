"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    if (process.env.APP_ENV === "test") {
      return;
    }
    const GENDERS = {
      MALE: "MALE",
      FEMALE: "FEMALE",
      OTHER: "OTHER",
    };

    const countryCode = "+972";

    const generateLegalPhone = (countryCode) => {
      return `${countryCode}${Math.floor(100000000 + Math.random() * 900000000)}`;
    };

    const generateFakeUser = (index) => {
      const timestamp = new Date().toISOString();
      return {
        email: `user${index}@example.com`,
        first_name: `FirstName${index}`,
        last_name: `LastName${index}`,
        gender: Object.values(GENDERS)[Math.floor(Math.random() * 3)],
        phone: generateLegalPhone(countryCode),
        birthday: new Date(
          1970 + Math.floor(Math.random() * 40),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28),
        ).toISOString(),
        is_active: true,
        is_coach: Math.random() < 0.1, // 10% chance of being a coach
        is_gym_admin: Math.random() < 0.05, // 5% chance of being a gym admin
        is_super_admin: false,
        gym_id: 1,
        updatedAt: timestamp,
        createdAt: timestamp,
      };
    };

    const users = [
      // Keep original admin users
      {
        email: "guyvaserman1@gmail.com",
        first_name: "Guy",
        last_name: "Vaserman",
        gender: GENDERS.MALE,
        phone: generateLegalPhone(countryCode),
        birthday: new Date("1999-01-01").toISOString(),
        is_active: true,
        is_coach: true,
        is_gym_admin: true,
        is_super_admin: true,
        gym_id: 1,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        email: "oxedom@gmail.com",
        first_name: "Oded",
        last_name: "Domnitser",
        gender: GENDERS.MALE,
        phone: generateLegalPhone(countryCode),
        birthday: new Date("1999-01-01").toISOString(),
        is_active: true,
        is_coach: false,
        is_gym_admin: false,
        is_super_admin: true,
        gym_id: 1,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        email: "omer.szabo@gmail.com",
        first_name: "Omer",
        last_name: "Szabo",
        gender: GENDERS.MALE,
        phone: generateLegalPhone(countryCode),
        birthday: new Date("1999-01-01").toISOString(),
        is_active: true,
        is_coach: false,
        is_gym_admin: false,
        is_super_admin: false,
        gym_id: 1,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        email: "danbinnun1@gmail.com",
        first_name: "Dan",
        last_name: "Binnun",
        gender: GENDERS.MALE,
        phone: null,
        birthday: new Date("1999-02-01").toISOString(),
        is_active: true,
        is_coach: true,
        is_gym_admin: true,
        is_super_admin: true,
        gym_id: 1,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      // Generate 100 fake users
      // ...Array.from({ length: 100 }, (_, i) => generateFakeUser(i + 1)),
    ];

    await queryInterface.bulkInsert("users", users);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("users", null, {});
  },
};
