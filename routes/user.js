const express = require('express');
const router = express.Router();

const { 
    postUser, loginHandler, getUserByToken,
  } = require('../controller/user');
  
// register
router.post("/users/register", postUser);

// login
router.get("/users/login", loginHandler);

// lihat profil sendiri
router.get("/users/fetch-by-token", getUserByToken);

module.exports = router;