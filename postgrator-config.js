require('dotenv').config();

module.exports = {
  migrationDirecotry: "migrations",
  driver: "pg",
  connectionString: (process.env.NODE_ENV === 'test')
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL
};