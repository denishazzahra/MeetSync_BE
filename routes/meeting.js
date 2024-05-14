const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload_file");

const {
  createSchedule,
  getMeetingDetails,
  bookSpecificMeeting,
  getBookedMeeting,
  deleteMeeting,
  getAllMeetings,
} = require("../controller/meeting");

//buat schedule baru
router.post("/meetings/add-new-meeting", createSchedule);

// get all meetings
router.get("/meetings/get-meetings", getAllMeetings);

//get meeting details
router.get("/meetings/get-meeting/:meetingId", getMeetingDetails);

//book specific meeting
router.put("/meetings/book-schedule/:scheduleId", bookSpecificMeeting);

//get all booked meetings
router.get("/meetings/booked-meetings", getBookedMeeting);

//delete a meeting
router.delete("/meetings/delete-meeting/:meetingId", deleteMeeting);

module.exports = router;
