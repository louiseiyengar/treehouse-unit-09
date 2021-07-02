const bcryptjs = require('bcryptjs');
const salt = bcryptjs.genSaltSync(10);

const db = require('./db');
const { User } = db.models;

async function authenticatedUser(credentials) {
  if (credentials) {
    const user = await User.findOne({ where: { emailAddress: credentials.name } });
    if (user) {
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
      if (authenticated) {
        return user;
      } else {
        throw new Error('Authorization Error: Password incorrect');
      }
    } else {
      throw new Error("Authentication Error: No user found with email address sent");
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
        err.status = 401;
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

module.exports = {
  authenticatedUser,
  asyncHandler,
  properCase,
  isDuplicateEmail
}