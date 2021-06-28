const express = require('express');
const router = express.Router();

const { sequelize } = require('../db');
const db = require('../db');
const { Course, User } = db.models;

function asyncHandler(cb){
  return async (req, res, next)=>{
    try {
      await cb(req,res, next);
    } catch(err){
      next(err);
    }
  };
}

router.get('/', asyncHandler(async (req, res)=> {
  const courses = await Course.findAll();
  courseList = courses.map(course=>course.toJSON());
  res.status(200).json(courseList);
}));

router.get('/:id', (req, res)=>{
  res.status(200).json({list: "Course List"});
});

router.post('/', (req, res) => {
  res.status(201).location('/2').end();
});

router.put('/:id', (req, res) => {
  res.status(204).end();
})

router.delete('/:id', (req, res) => {
  res.status(204).end();
})

module.exports = router;