const express = require('express');
const router = express.Router();
const upload=require('../middleware/upload_file')

const { 
    createSchedule, getMeetingDetails
  } = require('../controller/meeting');

//buat schedule baru
router.post("/meetings/add-new-meeting", createSchedule)

//get meeting details
router.get("/meetings/:meetingId", getMeetingDetails)
module.exports = router;