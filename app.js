'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const { sequelize, models } = require('./db');
//const { User, Course } = models;

const usersRoutes = require('./routes/users-routes');
const coursesRoutes = require('./routes/courses-routes');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// TODO setup your api routes here
app.use('/api/users', usersRoutes);
app.use('/api/courses', coursesRoutes)

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// connect to db and test connection
(async () => {
  //await db.sequelize.sync();  //sync all models (tables) to database
  console.log('test')
  try {
      await sequelize.authenticate();
      console.log('Successful database connection');

      // console.log('Synchronizing the models with the database...');
      // await sequelize.sync({force: true});
  } catch (err) {
      err.message = 'There was an error connecting to the database';
      err.status = 500;
      next(err);
  }
}) ();

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
