const express = require('express');
const path = require('path');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {
    const { user_name, email, password } = req.body;
    // check for missing fields
    for (const field of ['user_name', 'email', 'password'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        });

    // validate password strength
    const passwordError = UsersService.validatePassword(password);
    if (passwordError)
      return res.status(400).json({ error: passwordError });

    const emailError = UsersService.validateEmail(email);
    if (emailError)
      return res.status(400).json({ error: emailError });

    let userExists;
    // validate user doesn't already exist
    UsersService.hasUserWithUserName(
      req.app.get('db'),
      user_name
    )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName) {
          userExists = true;
          return res.status(400).json({ error: 'Username already taken' });
        }
      })
      .catch(next);

    // validate email not already being used
    UsersService.hasUserWithEmail(
      req.app.get('db'),
      email
    )
      .then(hasUserWithEmail => {
        if (hasUserWithEmail) {
          userExists = true;
          return res.status(400).json({ error: 'Email is already being used' });
        }
      })
      .catch(next);

    // if all fields validated, hash password and create account
    if (!userExists) {
      // hash password with bcrypt
      return UsersService.hashPassword(password)
        .then(hashedPassword => {
          // create new user object with hashed password
          const newUser = {
            user_name,
            password: hashedPassword,
            email,
            date_created: 'now()',
          };

          // insert new user info into table
          // send user.id in header location and 
          return UsersService.insertUser(
            req.app.get('db'),
            newUser
          )
            .then(user => {
              res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${user.id}`))
                .json(UsersService.serializeUser(user));
            });
        })
        .catch(next);
    }
  });


module.exports = usersRouter;