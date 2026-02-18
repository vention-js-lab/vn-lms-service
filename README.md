# vn-lms-service

Minimal backend foundation for VN LMS.

## Stack

-   NestJS
-   Zod (env validation)
-   Postgres 17 (Docker)

## Local Setup

### 1. Start dependencies

``` bash
docker compose up
```

-   Postgres → localhost:5433\
-   MailHog UI → http://localhost:8025

### 2. Configure environment

``` bash
cp .env.example .env
```

### 3. Start API

``` bash
npm install
npm run dev
```

## Health Check

``` bash
GET http://localhost:8050/v1/health
```

Environment variables are validated at startup.\
Application fails fast if configuration is invalid.
