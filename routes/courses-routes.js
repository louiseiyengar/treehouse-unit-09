const express = require('express');
const router = express.Router();

const { sequelize } = require('../db');
const db = require('../db');
const { Course, User } = db.models;

const bodyParser = require('body-parser').json();
const auth = require('basic-auth');

// custom helper functions
const { authenticatedUser, asyncHandler, findCourse } = require('../helper');

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
    throw Error("No course found with this id")
  }
}));

/*
  allow any authenticated user to create a new course
*/
router.post('/', bodyParser, asyncHandler(async (req, res) => {
  //authenticate user
  await authenticatedUser(auth(req));

  //insert new course in database
  const newRecord = await Course.create({
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded,
    userId: req.body.userId,
  });
  res.status(201).location('/' + newRecord.toJSON().id).end();
}));

/*
  update a course if user is authenticated and owns the course.
*/
router.put('/:id', bodyParser, asyncHandler(async (req, res) => {
  const id = req.params.id;
  const updateCourse = req.body;

  //remove these fields if api call included them
  delete updateCourse.createdAt;
  delete updateCourse.updatedAt;

  //determine if course exists and check that user is authenticated and owns the course
  const course = await findCourse(id);
  await authenticatedUser(auth(req), course.userId);

  await course.update(updateCourse);
  res.status(204).end();
}));

/*
  delete a course if user is authenticated and owns the course.
*/
router.delete('/:id', asyncHandler(async (req, res) => {
  const id = req.params.id;

  //determine if couse exists and check that user is authenticated and owns the course
  const course = await findCourse(id);
  await authenticatedUser(auth(req), course.userId);

  await course.destroy();
  res.status(204).end();
}));

module.exports = router;
