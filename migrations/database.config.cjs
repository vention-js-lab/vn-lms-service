require('dotenv').config({
  quiet: true,
});

const base = {
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  dialect: 'postgres',
  migrationStorageTableName: 'sequelize_meta',
};

module.exports = {
  development: base,
  test: base,
  production: base,
};
