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


module.exports = {
  makeUsersArray
};