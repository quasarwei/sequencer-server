const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const AuthService = {
  getUserWithUserName(db, user_name) {
    return db('sequencer_users')
      .where({ user_name })
      .first();
  },
  
};

module.exports = AuthService;