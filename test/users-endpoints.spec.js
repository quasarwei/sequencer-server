const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Users Endpoints', function () {
  let db;

  const { testUsers } = helpers.makeSequencerFixtures();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());
  before('cleanup', () => helpers.cleanTables(db));
  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /api/users', () => {
    context('User Validation', () => {
      beforeEach('insert users', () =>
        helpers.seedUsers(
          db,
          testUsers
        )
      );

      const requiredFields = ['user_name', 'email', 'password'];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          user_name: 'test user_name',
          email: 'email@email.com',
          password: 'test password',
        };

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post('/api/users')
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`
            });
        });
      });

      it('responds 400 \'Password must be at least 8 characters\' when empty password', () => {
        const userShortPass = {
          user_name: 'test user_name',
          password: '1234567',
          email: 'test@email.com'
        };
        return supertest(app)
          .post('/api/users')
          .send(userShortPass)
          .expect(400, { error: 'Password must be at least 8 characters long' });
      });

      it('responds 400 \'Password must be less than 72 characters\' when long password', () => {
        const userLongPass = {
          user_name: 'test user_name',
          password: '*'.repeat(73),
          email: 'test@email.com'
        };

        return supertest(app)
          .post('/api/users')
          .send(userLongPass)
          .expect(400, { error: 'Password must be less than 72 characters' });
      });

      it('responds 400 error when password starts with spaces', () => {
        const userPasswordStartsSpaces = {
          user_name: 'test user_name',
          password: ' Password1!',
          email: 'test@email.com'
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordStartsSpaces)
          .expect(400, { error: 'Password must not start or end with empty spaces' });
      });

      it('responds 400 error when password ends with spaces', () => {
        const userPasswordEndsSpaces = {
          user_name: 'test user_name',
          password: 'Password1! ',
          email: 'test@email.com'
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordEndsSpaces)
          .expect(400, { error: 'Password must not start or end with empty spaces' });
      });

      it('responds 400 error when password isn\'t complex enough', () => {
        const userPasswordNotComplex = {
          user_name: 'test user_name',
          password: '11aaAAbb',
          email: 'test@email.com'
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordNotComplex)
          .expect(400, { error: 'Password must contain 1 upper case, lower case, number, and special character' });
      });

      it('responds 400 error when email not valid format', () => {
        const invalidEmailUser = {
          user_name: 'test user_name',
          password: 'Password1!',
          email: 'fgh@s.m'
        };

        return supertest(app)
          .post('/api/users')
          .send(invalidEmailUser)
          .expect(400, { error: 'Email is invalid' });
      });

      it('responds 400 \'Username already taken\' when user_name isn\'t unique', () => {
        const duplicateUser = {
          user_name: testUser.user_name,
          password: 'Password1!',
          email: 'test@email.com'
        };
        return supertest(app)
          .post('/api/users')
          .send(duplicateUser)
          .expect(400, { error: 'Username already taken' });
      });

      it('responds 400 \'Email already taken\' when email isn\'t unique', () => {
        const duplicateEmail = {
          user_name: 'test user-name1324',
          password: 'Password1!',
          email: testUser.email
        };
        return supertest(app)
          .post('/api/users')
          .send(duplicateEmail)
          .expect(400, { error: 'Email is already being used' });
      });
    });

    context('Happy path', () => {
      it('responds 201, serialized user, storing bcrypted password', () => {
        const newUser = {
          user_name: 'test user_name12345',
          password: '11AAaa!!123',
          email: 'test123@email.com'
        };

        return supertest(app)
          .post('api/users')
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.user_name).to.eql(newUser.user_name);
            expect(res.body.email).to.eql(newUser.email);
            expect(res.body).to.not.have.property('password');
            expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
            const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' });
            const actualDate = new Date(res.body.date_created).toLocaleString();
            expect(actualDate).to.eql(expectedDate);
          })
          .expect(res =>
            db
              .from('sequencer_users')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.user_name).to.eql(newUser.user_name);
                expect(row.email).to.eql(newUser.email);
                const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' });
                const actualDate = new Date(row.date_created).toLocaleString();
                expect(actualDate).to.eql(expectedDate);

                return bcrypt.compare(newUser.password, row.password);
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true;
              })
          );
      });
    });
  });
});