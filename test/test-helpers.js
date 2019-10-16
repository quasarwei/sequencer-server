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

function makeSequencerFixtures() {
  const testUsers = makeUsersArray();
  return { testUsers };
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        sequencer_users
      `
    )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE sequencer_users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('sequencer_users_id_seq', 0)`),
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

function makeAuthHeader(user, secret=process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject:user.user_name,
    algorithm: 'HS256'
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeSequencerFixtures,
  cleanTables,
  seedUsers,
  makeAuthHeader
};