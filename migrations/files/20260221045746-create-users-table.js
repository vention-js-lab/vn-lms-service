'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`, { transaction });

      await queryInterface.sequelize.query(
        `
        DO $$
        BEGIN
          CREATE TYPE user_role_enum AS ENUM ('admin', 'hr', 'instructor', 'student');
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END
        $$;
        `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
        DO $$
        BEGIN
          CREATE TYPE user_status_enum AS ENUM ('active', 'disabled');
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END
        $$;
        `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL UNIQUE,
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          password VARCHAR(255) NOT NULL,
          role user_role_enum NOT NULL DEFAULT 'student',
          status user_status_enum NOT NULL DEFAULT 'active',
          deleted_at TIMESTAMP WITH TIME ZONE NULL,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        `,
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(`DROP TABLE IF EXISTS users;`, { transaction });
      await queryInterface.sequelize.query(`DROP TYPE IF EXISTS user_status_enum;`, { transaction });
      await queryInterface.sequelize.query(`DROP TYPE IF EXISTS user_role_enum;`, { transaction });
    });
  },
};
