const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Projects Endpoints', function () {
  let db;
  const { testProjects, testUsers } = helpers.makeSequencerFixtures();
  const testProject = testProjects[0];
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());
  before('cleanup', () => helpers.cleanTables(db));
  afterEach('cleanup', () => helpers.cleanTables(db));

  /*   describe('POST /api/projects', () => {
      context('')
    }); */

  describe('GET /api/projects/users/:userid', () => {
    beforeEach(() =>
      helpers.seedProjects(
        db, testUsers, testProjects
      )
    );

    context('given user doesn\'t exist or not authorized user', () => {
      it('responds 401, unauthorized request', () => {
        return supertest(app)
          .get('/api/projects/users/123456')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(401, {
            error: 'Unauthorized request'
          });
      });
    });

    context('given proper authorization, but no projects', () => {
      it('responds 200, empty array', () => {
        return supertest(app)
          .get('/api/projects/users/3')
          .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
          .expect(200, []);
      });
    });

    context('given proper authorization, user has projects', () => {
      it('responds 200, array of projects', () => {
        let expectedArray = [];
        expectedArray.push(helpers.makeExpectedProject(testProject)
        );
        return supertest(app)
          .get('/api/projects/users/1')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0]).to.have.property('id');
            expect(res.body[0].title).to.eql(expectedArray[0].title);
            expect(res.body[0].project_data).to.eql(expectedArray[0].project_data);
            expect(res.body[0].user_id).to.eql(expectedArray[0].user_id);
            const expectedCreateDate = new Date(expectedArray[0].date_created).toLocaleString();
            const actualCreateDate = new Date(res.body[0].date_created).toLocaleString();
            expect(actualCreateDate).to.eql(expectedCreateDate);
          });
      });
    });

  });

  describe.only('GET /api/projects/:projectid', () => {
    beforeEach(() =>
      helpers.seedProjects(
        db, testUsers, testProjects
      )
    );

    context('given improper authorization', () => {
      it('responds 401, unauthorized request', () => {
        return supertest(app)
          .get('/api/projects/1')
          .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
          .expect(401, {
            error: 'Unauthorized request'
          });
      });
    })

    context('given proper authorization, but project doesn\'t exist', () => {
      it('responds 404, project doesn\'t exist', () => {
        return supertest(app)
          .get('/api/projects/1234')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, {
            error: 'Project doesn\'t exist'
          });
      });
    });

    context('given proper authorization and project exists', () => {
      it('responds 200 with project', () => {
        const expectedProject = helpers.makeExpectedProject(testProject);
        return supertest(app)
          .get('/api/projects/1')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.title).to.eql(expectedProject.title);
            expect(res.body.project_data).to.eql(expectedProject.project_data);
            expect(res.body.user_id).to.eql(expectedProject.user_id);
            const expectedCreateDate = new Date(expectedProject.date_created).toLocaleString();
            const actualCreateDate = new Date(res.body.date_created).toLocaleString();
            expect(actualCreateDate).to.eql(expectedCreateDate);
          });
      });
    });
  });

  describe('DELETE /api/projects/:projectid', () => {
    it('responds 401 not authorized', () => {
      
    });
    
    it('responds 204, no content', () => {

    });
  });

  /*
   describe('PATCH /api/projects/:projectid', () => {
     it('responds 400, req body must contain fields', () => {
      error: 'Request body muts contain either \'title\' or \'project_data\''
     };

     it('responds 204, no content', () => {

     });
   }); */

});