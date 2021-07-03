const bcryptjs = require('bcryptjs');
const salt = bcryptjs.genSaltSync(10);

const db = require('./db');
const { User, Course } = db.models;

/**
 * This is an all purpose async handler with try/catch and error message processing.  
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
      err.status = 400;
      if (err.name === 'SequelizeValidationError') {
        const errorsArray = err.errors.map(validationError => {
          if (validationError.validatorKey === 'isEmail') {
            return "Please provide a properly formatted email address";
          } else if (validationError.message.includes('Course.userId')) {
            return "Please provide a value for 'userId";
          } else {
            return validationError.message
          } 
        });
        err.message = errorsArray;
      } else if(err.message.includes("Authorization Error")) {
        err.status = (err.message.includes("Forbidden")) ? 403 : 401;
      }
      next(err);
    }
  };
}

/**
 * This function will will check the Basic-Auth header credentials passed into it.
 * It will cheeck that authorization credentials exist, that user exists, that the password is correct,
 * and, if a user id is sent for a course, it will check that the user owns the course.
 * 
 * @param {object} credentials
 * @param {integer} courseUserId, optional
 *
 * @return {object} will return authenticated user object from database.  Otherwise, it will throw errors.
*/
async function authenticatedUser(credentials, courseUserId=null) {
  if (credentials) {
    const user = await User.findOne({ where: { emailAddress: credentials.name } });
    if (user) {
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
      if (authenticated) {
        if (courseUserId) {
          if (user.id !== courseUserId) {
            throw new Error('Authorization Error - Forbidden: This is not a course you are allowed to edit');
          }
        }
        return user;
      } else {
        throw new Error('Authorization Error: Password incorrect');
      }
    } else {
      throw new Error("Authorization Error: No user found with email address sent");
    }
  } else {
    throw new Error("Authorization Error: No credentials sent")
  }
}

/**
 * This function will take a string and return the string formatted with first letter capitalized, all ther rest lower case.
 * 
 * @param {string} 
 * @return {string} formateed tring
*/
const properCase = (string) => {
  return (string && string.length > 1) ? string[0].toUpperCase() + string.slice(1).toLowerCase() : null;
};

/**
 * Will check if an email a is already in the database.
 * 
 * @param {string} email address
 * @return {boolean} 
*/
async function isDuplicateEmail(email) {
  const foundEmail = await User.findOne({ where: { emailAddress: email } });
  if (foundEmail) {
    throw new Error("User with this email already exists.");
  } else {
    return false;
  }
}

/**
 * Will check if an email a is already in the database.
 * 
 * @param {integer} id of course
 * @return {object} one course object 
*/
async function findCourse (courseId) {
  const course = await Course.findByPk(courseId);
  if (!course) {
    throw new Error("No course was found with this id")
  } else {
    return course;
  }
}

module.exports = {
  authenticatedUser,
  asyncHandler,
  properCase,
  isDuplicateEmail,
  findCourse
}