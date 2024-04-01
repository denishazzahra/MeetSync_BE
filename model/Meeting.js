const sequelize = require("../util/db_connect");
const Sequelize = require('sequelize');

const Meeting = sequelize.define('meetings',{
  id:{
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
  },
  name:{
      type: Sequelize.STRING,
      allowNull: false
  },
  description:{
      type: Sequelize.STRING,
      allowNull: false
  },
  place:{
      type: Sequelize.STRING,
      allowNull: false
  },
  datetime_start:{
      type: Sequelize.DATE,
      allowNull: true
  },
  datetime_end:{
    type: Sequelize.DATE,
    allowNull: true
  },
	duration_minute:{
    type: Sequelize.INTEGER,
    allowNull: false
  }
},{
  timestamps: false
})

module.exports = Meeting;