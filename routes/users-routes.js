const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');

const { sequelize } = require('../db');
const db = require('../db');
const { User } = db.models;

const bodyParser = require('body-parser').json();

const salt = bcryptjs.genSaltSync(10);

function asyncHandler(cb){
  return async (req, res, next)=>{
    try {
      await cb(req,res, next);
    } catch(err){
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
  user.password = bcryptjs.hashSync(user.password, salt);

  await User.create(user);
  res.status(201).location('/').end();
}));

module.exports = router;