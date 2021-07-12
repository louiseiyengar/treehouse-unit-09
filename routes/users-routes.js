const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const salt = bcryptjs.genSaltSync(10);

const db = require('../db');
const { User } = db.models;

const bodyParser = require('body-parser').json();

// custom helper functions
const { authenticateUser, asyncHandler  } = require('../route_middleware');

/*
  get authenticated user
*/
router.get('/', authenticateUser, asyncHandler (async (req, res)=>{
  //authenticateUser middleware will put authenticated user instance in req object
  const user = req.user;

  //remove these key:values when returning user json
  delete user.password;
  delete user.createdAt;
  delete user.updatedAt;

  res.status(200).json(user);
}));

/*
  create new user
*/
router.post('/', bodyParser, asyncHandler(async (req, res) => {

  //function to format string with first letter uppercase, the rest to be lowercase
  const properCase = (string) => {
    return (string && string.length > 1) ? string[0].toUpperCase() + string.slice(1).toLowerCase() : null;
  };

  const user = req.body;

  //remove these fields if api post included them
  delete user.createdAt;
  delete user.updatedAt;

  user.firstName = properCase(user.firstName);
  user.lastName = properCase(user.lastName);

  //ensure password is greater than 4 characters (my own rule) and hash password
  user.password = (user.password && user.password.length >= 4) ? 
    user.password = bcryptjs.hashSync(user.password, salt)
    : null;

  await User.create(user);
  res.status(201).location('/').end();
}));

module.exports = router;
