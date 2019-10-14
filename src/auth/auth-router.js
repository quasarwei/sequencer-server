const express = require('express');
const AuthService = require('./auth-service');

const authRouter = express.Router();
const jsonBodyParser = express.json();


/**
 * Route for authenticating user
 * Contains single post route for logging in
 */
authRouter
  .post('/login', jsonBodyParser, (req, res, next) => {
    const { user_name, password } = req.body;
    const loginUser = { user_name, password };

    for(const [key, value] of Object.entries(loginUser))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    
    AuthService.getUserWithUserName(
      req.app.get('db'),
      loginUser.user_name
    )
  });

module.exports = authRouter;
