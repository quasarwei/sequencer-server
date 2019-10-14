require('dotenv').config();

module.exports = {
  migrationDirecotry: "migrations",
  driver: "pg",
  connectionString: (process.env.NODE_ENV === 'test')
    ? process.env.TEST_DB_URL
    : process.env.DB_URL
};