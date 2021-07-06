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
      err.status = 400;
      if (err.name === 'SequelizeUniqueConstraintError') {
        err.message = "A user with this email address already exists"
      } else if (err.name === 'SequelizeValidationError') {
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
          err.status = (err.message.includes("Forbidden")) ? 403 : 40
      } else if(err.message.includes("No Course")) {
          err.status = 404;
      }
      next(err);
    }
  };
}

/**
 * This middleware function will check if the authorization data sent in the request header.  If 
 * user can be authenticated, the user instanct will be added to the req object.
 * 
 * @param {object} req
 * @param {object} res
 * @param {function} next 
 * @return Will add user instance to req object.
 * If there is an error, the error will go into the global error handler.
*/
async function authenticateUser( req, res, next) {
  try {
    credentials = auth(req);
    if (credentials) {
      const user = await User.findOne({ where: { emailAddress: credentials.name } });
      if (user) {
        const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
        if (authenticated) {
          //if user authenticated, user instance will be put in req object.
          req.user = user;
        } else {
          throw new Error('Authorization Error: Password incorrect');
        }
      } else {
        throw new Error("Authorization Error: No user found with email address sent");
      }
    } else {
      throw new Error("Authorization Error: No credentials sent")
    }
  } catch (err) {
    err.status = 401
    next(err);
  }
  next();
}

/**
 * This middleware function will check if the authorization data sent in the request header.  If 
 * user can be authenticated, the user instanct will be added to the req object.
 * 
 * @param {object} req
 * @param {object} res
 * @param {function} next 
 * @return If user owns course, course instance will be added to req object.
 * If there is an error, the error will go into the global error handler.
 * */
async function checkUserOwnsCourse( req, res, next) {
  try {
    const course = await findCourse(req.params.id);
    if (course.userId !== req.user.id) {
      throw new Error("Forbidden: You are not allowed to edit this course")
    }
    req.course = course;
  } catch(err) {
    err.status = 403;
    next(err);
  }
  next();
}

/**
 * Helper function: Will search for a course with an id
 * 
 * @param {integer} id of course
 * @return {object} one course object 
*/
async function findCourse (courseId) {
  const course = await Course.findByPk(courseId);
  if (!course) {
    throw new Error("No Course: course not found at this address");
  } else {
    return course;
  }
}

module.exports = {
  authenticateUser,
  checkUserOwnsCourse,
  asyncHandler,
  findCourse
}