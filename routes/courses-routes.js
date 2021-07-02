const express = require('express');
const router = express.Router();

const { sequelize } = require('../db');
const db = require('../db');
const { Course, User } = db.models;

const bodyParser = require('body-parser').json();

function asyncHandler(cb){
  return async (req, res, next)=>{
    try {
      await cb(req,res, next);
    } catch(err){
      if (err.name === 'SequelizeValidationError') {
        err.status = 400;
        const errorsArray = err.errors.map(validationError => validationError.message.includes('Course.userId') ? 
          "Please provide a value for 'userId'" 
          : validationError.message)
        err.message = errorsArray;
      } 
      next(err);
    }
  };
}

router.get('/', asyncHandler(async(req, res) => {
  const courses = await Course.findAll({ include: User });
  courseList = courses.map(course=>course.toJSON());
  res.status(200).json(courseList);
}));

router.get('/:id', asyncHandler(async(req, res) => {
  const id = req.params.id;
  const course = await Course.findByPk(id, { include: User });
  res.status(200).json(course);
}));

router.post('/', bodyParser, asyncHandler(async (req, res) => {
  const newRecord = await Course.create({
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded,
    userId: req.body.userId,
  });
  res.status(201).location('/' + newRecord.toJSON().id).end();
}));

router.put('/:id', bodyParser, asyncHandler(async (req, res) => {
  const id = req.params.id
  await Course.update(req.body, {
    where: {
      id: id
    }
  })
  res.status(204).end();
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = req.params.id;
  await Course.destroy({
    where: {
      id: id
    }
  });
  res.status(204).end();
}));

module.exports = router;
