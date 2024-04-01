const sequelize = require("../util/db_connect");
const Sequelize = require('sequelize');

const User = sequelize.define('users',{
  id:{
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
  },
  fullName:{
      type: Sequelize.STRING,
      allowNull: false
  },
  email:{
      type: Sequelize.STRING,
      allowNull: false
  },
  password:{
      type: Sequelize.STRING,
      allowNull: false
  },
  role:{
      type: Sequelize.ENUM("Teacher", "Student"),
      allowNull: true
  }
},{
  timestamps: false
})

module.exports = User;