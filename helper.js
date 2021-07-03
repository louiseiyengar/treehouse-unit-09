const bcryptjs = require('bcryptjs');
const salt = bcryptjs.genSaltSync(10);

const db = require('./db');
const { User, Course } = db.models;

async function authenticatedUser(credentials, courseUserId=null) {
  if (credentials) {
    const user = await User.findOne({ where: { emailAddress: credentials.name } });
    if (user) {
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
      if (authenticated) {
        if (courseUserId) {
          if (user.id !== courseUserId) {
            throw new Error('Authorization Error - Forbidden: This is not a course you own');
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

const properCase = (string) => {
  return (string && string.length > 1) ? string[0].toUpperCase() + string.slice(1).toLowerCase() : null;
};

async function isDuplicateEmail(email) {
  const foundEmail = await User.findOne({ where: { emailAddress: email } });
  console.dir(foundEmail);
  if (foundEmail) {
    throw new Error("User with this email already exists.");
  }
}

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