const sequelize = require("./db_connect");
const User = require("../model/User");
const Meeting = require("../model/Meeting");
const MeetingDetail = require("../model/MeetingDetail");

// relasi tabel meetings dengan users
User.hasMany(Meeting, { foreignKey: "teacherId" });
Meeting.belongsTo(User, { foreignKey: "teacherId", as: "teacher" });

//relasi tabel meetings dengan meeting_details
Meeting.hasMany(MeetingDetail);
MeetingDetail.belongsTo(Meeting);

//relasi tabel meeting_details dengan users
User.hasMany(MeetingDetail, { foreignKey: "studentId" });
MeetingDetail.belongsTo(User, { foreignKey: "studentId", as: "student" });

const association = async () => {
  try {
    await sequelize.sync({ force: false });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = association;
