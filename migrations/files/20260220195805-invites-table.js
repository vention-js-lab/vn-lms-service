'use strict';
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_type WHERE typname = 'user_role'
          ) THEN
            CREATE TYPE user_role AS ENUM (
              'admin',
              'hr',
              'instructor',
              'student'
            );
          END IF;
        END$$;
      `, { transaction });

      await queryInterface.sequelize.query(`
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      `, { transaction });

      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS "invites" (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

          email TEXT NOT NULL,

          first_name TEXT,
          last_name TEXT,

          role user_role NOT NULL,

          token TEXT NOT NULL,

          expires_at TIMESTAMPTZ NOT NULL,
          used_at TIMESTAMPTZ,
          revoked_at TIMESTAMPTZ,

          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `, { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(`
        DROP TABLE IF EXISTS "invites";
      `, { transaction });

      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS user_role;
      `, { transaction });
    });
  }
};
