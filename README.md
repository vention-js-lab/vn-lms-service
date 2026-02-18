# vn-lms-service

Minimal backend foundation for VN LMS.

## Stack

- NestJS
- Zod (env validation)
- Postgres 16 (Docker)
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

## Health Check

```bash
GET http://localhost:8050/v1/health
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
