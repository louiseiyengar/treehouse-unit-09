const express = require('express');
const router = express.Router();

const { sequelize } = require('../db');
const db = require('../db');
const { Course, User } = db.models;

const bodyParser = require('body-parser').json();
const auth = require('basic-auth');

const { authenticatedUser, asyncHandler, findCourse } = require('../helper');

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
  await authenticatedUser(auth(req));
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
  const id = req.params.id;
  const course = await findCourse(id);
  await authenticatedUser(auth(req), course.userId);
  await course.update(req.body);
  res.status(204).end();
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = req.params.id;
  const course = await findCourse(id);
  await authenticatedUser(auth(req), course.userId);
  await course.destroy();
  res.status(204).end();
}));

module.exports = router;
