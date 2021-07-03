const express = require('express');
const router = express.Router();
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const salt = bcryptjs.genSaltSync(10);

const db = require('../db');
const { User } = db.models;

const bodyParser = require('body-parser').json();

// custom helper functions
const { authenticatedUser, asyncHandler, properCase, isDuplicateEmail  } = require('../helper');

/*
  get authenticated user
*/
router.get('/', asyncHandler (async (req, res)=>{
  //find authenticated user
  const user = await authenticatedUser(auth(req));

  //remove these key:values when returning user json
  delete user.dataValues.password;
  delete user.dataValues.createdAt;
  delete user.dataValues.updatedAt;

  res.status(200).json(user);
}));

/*
  create new user
*/
router.post('/', bodyParser, asyncHandler(async (req, res) => {
  const user = req.body;

  //remove these fields if api post included them
  delete user.createdAt;
  delete user.updatedAt;

  //for names: ensure first letter is uppercase, rest is lowercase.
  user.firstName = properCase(user.firstName);
  user.lastName = properCase(user.lastName);

  //ensure password is greater than 4 characters (my own rule) and hash password
  user.password = (user.password && user.password.length >= 4) ? 
    user.password = bcryptjs.hashSync(user.password, salt)
    : null;

  //check if email is already in database
  (user.emailAddress) ? await isDuplicateEmail(user.emailAddress) : null; 

  await User.create(user);
  res.status(201).location('/').end();
}));

module.exports = router;
