const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');

//const { sequelize } = require('../db');
const db = require('../db');
//const user = require('../db/models/user');
const { User } = db.models;

const bodyParser = require('body-parser').json();

const salt = bcryptjs.genSaltSync(10);

function asyncHandler(cb){
  return async (req, res, next)=>{
    try {
      await cb(req,res, next);
    } catch(err){
      if (err.name === 'SequelizeValidationError') {
        err.status = 400;
        const errorsArray = err.errors.map(validationError => {
          if (validationError.validatorKey === 'isEmail') {
            return "Please provide a properly formatted email address"
          } else {
            return validationError.message
          } 
        });
        err.message = errorsArray;
      } 
      next(err);
    }
  };
}

/*
  return currently authenticated user
*/
router.get('/', asyncHandler (async (req, res)=>{
  const authUserId = 2;
  const authUser = await User.findByPk(authUserId);
  res.status(200).json(authUser);
}));

/*
  return update user
*/
router.post('/', bodyParser, asyncHandler(async (req, res) => {
  const user = req.body;

  //For names: ensure first letter is uppercase, rest is lowercase.
 const properCase = (name) => {
    return (name && name.length > 1) ? name[0].toUpperCase() + name.slice(1).toLowerCase() : null;
  };
  user.firstName = properCase(user.firstName);
  user.lastName = properCase(user.lastName);

  user.password = (user.password && user.password.length >= 4) ? 
    user.password = bcryptjs.hashSync(user.password, salt)
    : null;

  await User.create(user);
  res.status(201).location('/').end();
}));

module.exports = router;
