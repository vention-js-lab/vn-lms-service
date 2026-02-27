'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        `
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
                CREATE TYPE user_role_enum AS ENUM ('admin', 'hr', 'instructor', 'student');
            END IF;
        END $$;
        `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status_enum') THEN
                CREATE TYPE user_status_enum AS ENUM ('active', 'disabled');
            END IF;
        END $$;
        `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL UNIQUE,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          password TEXT NOT NULL,
          role user_role_enum NOT NULL,
          status user_status_enum NOT NULL,
          deleted_at TIMESTAMPTZ NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
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
