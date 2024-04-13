const express = require('express');
const router = express.Router();
const upload=require('../middleware/upload_file')

const { 
    postUser, loginHandler, getUserByToken, changeProfilePicture, getAllUsers,
  } = require('../controller/user');
  
// register
router.post("/users/register", postUser);

// login
router.get("/users/login", loginHandler);

// lihat profil sendiri
router.get("/users/fetch-by-token", getUserByToken);

// ganti profile picture
router.put("/users/change-profile-picture", upload.single('image'), changeProfilePicture)

// ambil semua user
router.get("/users/fetch-all", getAllUsers)

module.exports = router;