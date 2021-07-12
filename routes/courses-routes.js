const express = require('express');
const router = express.Router();

const db = require('../db');
const { Course, User } = db.models;

const bodyParser = require('body-parser').json();

// route middleware functions and async handler
const { authenticateUser, checkUserOwnsCourse, asyncHandler } = require('../route_middleware');

/*
  get all courses with users
*/
router.get('/', asyncHandler(async(req, res) => {

  //select all courses with certain fields displayed - course to show user associated with it
  const courses = await Course.findAll({ 
    attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
    include: {
      model: User,
      attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
    }
  });
  const courseList = courses.map(course=>course.toJSON());
  res.status(200).json(courseList);
}));

/*
  get one course with user
*/
router.get('/:id', asyncHandler(async(req, res) => {
  const id = req.params.id;
  const course = await Course.findByPk(id, {
    attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
    include: {
      model: User,
      attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
    }
  });
  if (course) {
    res.status(200).json(course);
  } else {
    throw new Error("No Course: course not found at this address")
  }
}));

/*
  allow any authenticated user to create a new course
*/
router.post('/', bodyParser, authenticateUser, asyncHandler(async (req, res) => {
  //insert new course in database
  const newRecord = await Course.create({
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded,
    userId: req.user.id,      //this is the authenticated user's id
  });

  res.status(201).location('/api/courses/' + newRecord.id).end();
}));

/*
  update a course if user is authenticated and owns the course.
*/
router.put('/:id', bodyParser, authenticateUser, checkUserOwnsCourse, asyncHandler(async (req, res) => {
  const updateCourse = req.body;

  //remove these fields if api call included them
  delete updateCourse.createdAt;
  delete updateCourse.updatedAt;
  delete updateCourse.userId;

  const course = req.course;
  await course.update(updateCourse);
  res.status(204).end();
}));

/*
  delete a course if user is authenticated and owns the course.
*/
router.delete('/:id', authenticateUser, checkUserOwnsCourse, asyncHandler(async (req, res) => {
  //checkUserOwnsCourse middleware will put the course instance in the req object, if user owns the course
  const course = req.course;
  await course.destroy();
  res.status(204).end();
}));

module.exports = router;
