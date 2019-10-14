module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_TOKEN: process.env.API_TOKEN || 'dummy token',
  DB_URL: process.env.DB_URL || 'postgresql://postgres@localhost/sequencer',
  DB_TEST_URL: process.env.DB_TEST_URL || 'postgresql://postgres@localhost/sequencer-test',
  JWT_SECRET: process.env.JWT_SECRET || 'my-jwt-secret-only'
};