const express = require('express');
const AuthService = require('./auth-service');

const authRouter = express.Router();
const jsonBodyParser = express.json();


/**
 * Route for authenticating user
 * Contains single post route for logging in
 * send jwt on successful login
 */
authRouter
  .post('/login', jsonBodyParser, (req, res, next) => {
    const { user_name, password } = req.body;
    const loginUser = { user_name, password };

    for (const [key, value] of Object.entries(loginUser))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });

    AuthService.getUserWithUserName(
      req.app.get('db'),
      loginUser.user_name
    )
      .then(dbUser => {
        // verify username exists
        if (!dbUser)  // path user doesn't exist
          return res.status(400).json({
            error: 'Incorrect user_name or password'
          });
        // verify password
        return AuthService.comparePasswords(loginUser.password, dbUser.password)
          .then(compareMatch => {
            // path password doesn't match
            if (!compareMatch)
              return res.status(400).json({
                error: 'Incorrect user_name or password'
              });
            const sub = dbUser.user_name;
            const payload = { user_id: dbUser.id };
            // login is good - send jwt
            res.send({
              authToken: AuthService.createJwt(sub, payload),
            });
          });
      })
      .catch(next);
  });

module.exports = authRouter;
