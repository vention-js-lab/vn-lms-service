import { defineConfig } from 'prisma/config';
import 'dotenv/config';

const databaseUrl = `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}?schema=public`;

export default defineConfig({
  schema: 'src/modules/database/schema/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
});
