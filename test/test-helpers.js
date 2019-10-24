const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      email: 'test-user1@email.com',
      password: 'Password123!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      user_name: 'test-user-2',
      email: 'test-user2@email.com',
      password: 'Password123!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      user_name: 'test-user-3',
      email: 'test-user3@email.com',
      password: 'Password123!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ];
}

function makeProjectsArray() {
  return [
    {
      id: 1,
      title: 'project one',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      date_modified: null,
      project_data: {
        bpm: 130,
        notes: [['0:0:3', 'C4'],
        ['0:1:3', 'D4'], ['0:2:3', 'E4']]
      },
      user_id: 1,
    },
    {
      id: 2,
      title: 'project two',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      date_modified: null,
      project_data: {
        bpm: 150,
        notes: [['0:0:3', 'C4'],
        ['0:1:3', 'D4'], ['0:2:3', 'E4']]
      },
      user_id: 2,
    },
    {
      id: 3,
      title: 'project three',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      date_modified: null,
      project_data: {
        bpm: 140,
        notes: [['0:0:3', 'C4'],
        ['0:1:3', 'D4'], ['0:2:3', 'E4']]
      },
      user_id: 2,
    },
  ]
};

function makeExpectedProject(project) {
/*   const user = users
    .find(user => user.id === project.user_id);
   */
  return {
    id: project.id,
    title: project.title,
    date_created: project.date_created.toISOString(),
    date_modified: project.date_modified || null,
    user_id: project.user_id,
    project_data: project.project_data
  }
};

function makeSequencerFixtures() {
  const testUsers = makeUsersArray();
  const testProjects = makeProjectsArray();
  return { testUsers, testProjects };
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        sequencer_users,
        sequencer_projects
      `
    )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE sequencer_users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE sequencer_projects_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('sequencer_users_id_seq', 0)`),
          trx.raw(`SELECT setval('sequencer_projects_id_seq', 0)`),
        ])
      )
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('sequencer_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('sequencer_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedProjects(db, users, projects) {
  return db.transaction(async trx => {
    await seedUsers(trx, users);
    await trx.into('sequencer_projects').insert(projects);

    await trx.raw(
      `SELECT setval('sequencer_projects_id_seq', ?)`,
      [projects[projects.length - 1].id],
    )
  });
};

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256'
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeSequencerFixtures,
  makeExpectedProject,
  cleanTables,
  seedUsers,
  seedProjects,
  makeAuthHeader
};