const express = require('express');
const router = express.Router();
const upload=require('../middleware/upload_file')

const { 
    createSchedule, getMeetingDetails,
    bookSpecificMeeting
  } = require('../controller/meeting');

//buat schedule baru
router.post("/meetings/add-new-meeting", createSchedule)

//get meeting details
router.get("/meetings/:meetingId", getMeetingDetails)

//book specific meeting
router.put("/meetings/book-schedule/:scheduleId", bookSpecificMeeting)
module.exports = router;