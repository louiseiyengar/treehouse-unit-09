const bcryptjs = require('bcryptjs');

const db = require('./db');
const auth = require('basic-auth');
const { User, Course } = db.models;

/**
 * This isn't actually middleware, but an all purpose async handler with try/catch and error message processing.  
 * NOTE: the functions passed into my router routes go through this function.
 * 
 * @param {function} functions passed into router routes 
 * @return Will run the function if no error.
 * If there is an error, it will process the error message that will go into the global error handler.
*/
function asyncHandler(cb){
  return async (req, res, next)=>{
    try {
      await cb(req,res, next);
    } catch(err){
      if (err.name === 'SequelizeUniqueConstraintError') {
        err.status = 400;
        err.message = "A user with this email address already exists"
      } else if (err.name === 'SequelizeValidationError') {
        err.status = 400;
        err.message = validationErrors(err);
      } else if(err.message.includes("No Course")) {
          err.status = 404;
      }
      next(err);
    }
  };
}

/**
 * Helper function to create an array of all validation error messages.
 * Note that proper email format is checked by Sequelize's isEmail validation.
 * 
 * @param {object} error object
 * @return {array} Array of all validation messages.
*/
function validationErrors(err) {
  return err.errors.map(validationError => {
    if (validationError.validatorKey === 'isEmail') {
      return "Please provide a properly formatted email address for this user";
    } else {
      return validationError.message
    } 
  });
}

/**
 * Helper function that uses a regular expression to test if an email is properly formatted.
 * And no, I didn't come up with this regEx.  It was found in the under the JavaScript header at
 * http://emailregex.com/
 * 
 * @param {object} error object
 * @return {array} Array of all validation messages.
*/
function isValidEmail(emailAddress) {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return regEx.test(emailAddress.toLowerCase());
}

/**
 * This middleware function will check if a user can be authenticated by the authorize data sent in 
 * the request header.  If user can be authenticated, the user will be added to the req object in JSON format.
 * 
 * Note that the email format is tested by a RegEx in the isValidEmail helper function.
 * 
 * @param {object} req
 * @param {object} res
 * @param {function} next 
 * @return Will add user in JSON format will be added to req object.
 * If there is an error, the error will go into the global error handler.
*/
async function authenticateUser( req, res, next) {
  try {
    credentials = auth(req);
    if (credentials) {
      if (!isValidEmail(credentials.name)) {
        throw new Error("Authentication Error - Username: Please provide your email address, properly formatted, as a username.");
      }
      const user = await User.findOne({ where: { emailAddress: credentials.name } });
      if (user) {
        const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
        if (authenticated) {
          //if user authenticated, user in JSON format will be put in req object.
          req.user = user.toJSON();
        } else {
          throw new Error('Authentication Error: Password incorrect');
        }
      } else {
        throw new Error("Authentication Error: No user found with email address sent");
      }
    } else {
      throw new Error("Authentication Error: No credentials sent")
    }
  } catch (err) {
    err.status = err.message.includes("Authentication Error - Username") ? 400 : 401;
    next(err);
  }
  next();
}

/**
 * This middleware function checks that users own the courses they are attempting to 
 * modify or delete.
 * 
 * @param {object} req
 * @param {object} res
 * @param {function} next 
 * @return If user owns course, course instance will be added to req object.
 * If there is an error, the error will go into the global error handler.
 * */
async function checkUserOwnsCourse( req, res, next) {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      throw new Error("No Course: course not found at this address");
    } else if (course.userId !== req.user.id) {
      throw new Error("Authorization Error: You are not allowed to edit or delete this course")
    }
    //course instance added to req object
    req.course = course;
  } catch(err) {
    err.status = (err.message.includes("Authorization Error")) ? 403 : 404;
    next(err);
  }
  next();
}

module.exports = {
  authenticateUser,
  checkUserOwnsCourse,
  asyncHandler
}
