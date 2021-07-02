const express = require('express');
const router = express.Router();
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const salt = bcryptjs.genSaltSync(10);

const db = require('../db');
const { User } = db.models;

const bodyParser = require('body-parser').json();

const { authenticatedUser, asyncHandler, properCase, isDuplicateEmail  } = require('../helper');

/*
  return currently authenticated user
*/
router.get('/', asyncHandler (async (req, res)=>{
  const user = await authenticatedUser(auth(req));
  res.status(200).json(user);
}));

/*
  return update user
*/
router.post('/', bodyParser, asyncHandler(async (req, res) => {
  const user = req.body;

  //For names: ensure first letter is uppercase, rest is lowercase.
  user.firstName = properCase(user.firstName);
  user.lastName = properCase(user.lastName);

  user.password = (user.password && user.password.length >= 4) ? 
    user.password = bcryptjs.hashSync(user.password, salt)
    : null;

  (user.emailAddress) ? await isDuplicateEmail(user.emailAddress) : null; 

  await User.create(user);
  res.status(201).location('/').end();
}));

module.exports = router;
