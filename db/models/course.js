const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Model {}
  Course.init({
    // Set custom primary key column, though sequelize will add automatically if not specified
    // id: {
    //   type: DataTypes.INTEGER,
    //   primaryKey: true,
    //   autoIncrement: true,
    // },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide a value for 'title'" },
        notNull: { msg: "Please provide a value for 'title'"}
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Please provide a value for 'description'" },
        notNull: { msg: "Please provide a value for 'description'"}
      }
    },
    estimatedTime: {
      type: DataTypes.STRING,
    },
    materialsNeeded: {
      type: DataTypes.STRING,
    },
  },
  { 
    timestamps: false,
    sequelize,
  });

  Course.associate = (models) => {
    Course.belongsTo(models.User);
  };

  return Course;
}