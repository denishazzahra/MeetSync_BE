const express = require('express');
const router = express.Router();
const upload=require('../middleware/upload_file')

const { 
    postUser, loginHandler, getUserByToken, getAllUsers,
    getTeacherMeetings,
    editProfile,
  } = require('../controller/user');
  
// register
router.post("/users/register", postUser);

// login
router.get("/users/login", loginHandler);

// lihat profil sendiri
router.get("/users/fetch-by-token", getUserByToken);

// ganti profile picture
router.put("/users/edit-account", upload.single('image'), editProfile)

// ambil semua user
router.get("/users/fetch-all", getAllUsers)

// ambil semua meeting milik teacher spesifik
router.get("/users/meeting-list/:teacherId", getTeacherMeetings)

module.exports = router;