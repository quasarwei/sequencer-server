process.env.TZ = 'UTC';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';

require('dotenv').config();

process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL
  || "postgresql://postgres@localhost/sequencer-test";

const { expect } = require('chai');
const supertest = require('supertest');

global.expect = expect;
global.supertest = supertest;