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

  describe('POST /api/projects', () => {
    beforeEach(() =>
      helpers.seedProjects(
        db, testUsers, testProjects
      )
    );

    const requiredFields = ['title', 'project_data'];
    requiredFields.forEach(field => {
      const newProject = {
        title: 'Test new project',
        project_data: {
          bpm: 130,
          notes: [['0:0:1', 'C4'], ['0:1:1', 'D4']]
        }
      };

      it(`responds 400 and error msg when '${field}' is missing`, () => {
        delete newProject[field];

        return supertest(app)
          .post('/api/projects')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newProject)
          .expect(400, {
            error: `Missing '${field}' in request body`
          })
      });
    });

    it('responds 201 and creates new project', () => {
      const newProject = {
        title: 'Test new project',
        project_data: {
          bpm: 130,
          notes: [['0:0:1', 'C4'], ['0:1:1', 'D4']]
        }
      }

      return supertest(app)
        .post('/api/projects')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newProject)
        .expect(201)
        .then(res => {
          expect(res.body.id).to.eql(4);
          expect(res.body.title).to.eql(newProject.title);
          expect(res.body.user_id).to.eql(1);
          expect(res.body.project_data).to.eql(newProject.project_data);
          expect(res.headers.location).to.eql(`/api/projects/${res.body.id}`)
        })
        .then(res =>
          supertest(app)
            .get(`/api/projects/4`)
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .expect(200)
            .expect(res => {
              expect(res.body).to.have.property('id');
              expect(res.body.title).to.eql(newProject.title);
              expect(res.body.project_data).to.eql(newProject.project_data);
              expect(res.body.user_id).to.eql(testUser.id);
            })
        );
    });

    it('removes XSS attack content from response', () => {
      const { maliciousProject, expectedProject } = helpers.makeMaliciousProject();
      return supertest(app)
        .post('/api/projects')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(maliciousProject)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(expectedProject.title);
        })
    });

  });

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

  describe('GET /api/projects/:projectid', () => {
    context('given project doesn\'t exist', () => {
      beforeEach(() =>
        helpers.seedProjects(
          db, testUsers, testProjects
        )
      );
      it('responds 404, project doesn\'t exist', () => {
        return supertest(app)
          .get('/api/projects/1234')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, {
            error: 'Project doesn\'t exist'
          });
      });
    });

    context('given improper authorization', () => {
      beforeEach(() =>
        helpers.seedProjects(
          db, testUsers, testProjects
        )
      );
      it('responds 401, unauthorized request', () => {
        return supertest(app)
          .get('/api/projects/1')
          .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
          .expect(401, {
            error: 'Unauthorized request'
          });
      });
    });

    context('given proper authorization and project exists', () => {
      beforeEach(() =>
        helpers.seedProjects(
          db, testUsers, testProjects
        )
      );
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

    context('given an XSS attack article', () => {
      const { maliciousProject, expectedProject } = helpers.makeMaliciousProject();
      before('insert malicious project', () => {
        return helpers.seedMaliciousProject(
          db, testUser, maliciousProject
        )
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get('/api/projects/111')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedProject.title);
          })
      })
    });
  });

  describe('DELETE /api/projects/:projectid', () => {
    beforeEach(() =>
      helpers.seedProjects(
        db, testUsers, testProjects
      )
    );
    context('given improper authorization', () => {
      it('responds 401 not authorized', () => {
        return supertest(app)
          .delete('/api/projects/1')
          .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
          .expect(401, {
            error: 'Unauthorized request'
          });
      });
    });

    context('given proper authorization', () => {
      it('responds 204, no content', () => {
        return supertest(app)
          .delete('/api/projects/1')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(204);
      });
    })
  });

  describe('PATCH /api/projects/:projectid', () => {
    beforeEach(() =>
      helpers.seedProjects(
        db, testUsers, testProjects
      )
    );
    it('responds 400, req body must contain fields', () => {
      return supertest(app)
        .patch('/api/projects/1')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send({})
        .expect(400, {
          error: 'Request body must contain either \'title\' or \'project_data\''
        });
    });

    it('responds 204, no content', () => {
      const updatedProject = { title: 'updated title' };
      const expectedProject = {
        ...testProjects[0],
        title: 'updated title'
      };
      return supertest(app)
        .patch('/api/projects/1')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(updatedProject)
        .expect(204)
        .then(res =>
          supertest(app)
            .get('/api/projects/1')
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .then(res => {
              expect(res.body).to.have.property('id');
              expect(res.body.title).to.eql(expectedProject.title);
              expect(res.body.project_data).to.eql(expectedProject.project_data);
              expect(res.body.user_id).to.eql(expectedProject.user_id);
            }));
    });
  });

});