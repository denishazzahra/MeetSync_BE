const sequelize = require("../util/db_connect");
const Sequelize = require('sequelize');

const MeetingDetail = sequelize.define('meeting_details',{
  id:{
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
  },
  datetime_start:{
      type: Sequelize.DATE,
      allowNull: false
  },
  datetime_end:{
    type: Sequelize.DATE,
    allowNull: false
  },
},{
  timestamps: false
})

module.exports = MeetingDetail;