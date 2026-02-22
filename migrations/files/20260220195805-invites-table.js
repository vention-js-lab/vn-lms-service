'use strict';
module.exports = {
  async up(queryInterface) {
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
    `);

    await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `);

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
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS invites_token_idx
      ON invites(token);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS invites_email_idx
      ON invites(email);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS invites_expires_idx
      ON invites(expires_at);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS invites_used_idx
      ON invites(used_at);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS invites_revoked_idx
      ON invites(revoked_at);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS "invites";
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS user_role;
    `);
  }
};