# vn-lms-service

Minimal backend foundation for VN LMS.

## Stack

- NestJS
- Zod (env validation)
- Postgres 17.8 (Docker)
- MailHog (local email testing)
- ESLint + Prettier (code quality & formatting)
- Husky (Git hooks)

## Local Setup

### 1. Start dependencies

```bash
docker compose up
```

- Postgres → localhost:5433\
- MailHog UI → http://localhost:8025

### 2. Configure environment

```bash
cp .env.example .env
```

### 3. Start API

```bash
npm install
npm run dev
```

## Health Checks the API and DB is running correctly.

```bash
GET http://localhost:8050/health
```

```bash
Check for lint errors: `npm run lint`
Automatically fix lint issues: `npm run lint:fix`
Check formatting: `npm run format`
Fix formatting: `npm run format:fix`
Run unit tests: `npm test` / `npm run test:watch`

```

Environment variables are validated at startup.\
Application fails fast if configuration is invalid.

## Database Migrations

Create new migration with running:

```bash
npm run db:migration:create <migration-name>
```
Edit the generated migration file in `src/migrations` to define the schema changes.

```js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
```
Apply the migrations to the prisma schema and database with:

```bash
npm run db:up
```
You can rollback the last migration with:

```bash
npm run db:down
```

You can roll back all migrations with:

```bash
npm run db:down:all
```
You can start database studio with:

```bash
npm run db:studio
```
