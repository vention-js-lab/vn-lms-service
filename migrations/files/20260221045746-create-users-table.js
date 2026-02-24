'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create enums
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
          CREATE TYPE user_role_enum AS ENUM ('admin', 'hr', 'instructor', 'student');
        END IF;
      END
      $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status_enum') THEN
          CREATE TYPE user_status_enum AS ENUM ('active', 'invited', 'disabled');
        END IF;
      END
      $$;
    `);

    // Create Users table
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      first_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      last_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: 'user_role_enum',
        allowNull: false,
        defaultValue: 'student',
      },
      status: {
        type: 'user_status_enum',
        allowNull: false,
        defaultValue: 'active',
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop Users table
    await queryInterface.dropTable('Users');

    // Drop enums
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS user_role_enum;
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS user_status_enum;
    `);
  },
};
