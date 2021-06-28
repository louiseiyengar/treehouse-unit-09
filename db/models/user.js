const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {}
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide a value for 'firstName'" },
        notNull: { msg: "Please provide a value for 'FirstName'"}
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide a value for 'lastName'" },
        notNull: { msg: "Please provide a value for 'lastName'"}
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide a value for 'lastName'" },
        notNull: { msg: "Please provide a value for 'lastName'"}
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide a value for 'emailAddress'" },
        notNull: { msg: "Please provide a value for 'emailAddress'"}
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide a value for 'password'" },
        notNull: { msg: "Please provide a value for 'password'"}
      }
    }
  }, { sequelize });

  User.associate = (models) => {
    User.hasMany(models.Course);
  };

  return User;
}
