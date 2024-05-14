require("dotenv").config();
const User = require("../model/User");
const Meeting = require("../model/Meeting");
const MeetingDetail = require("../model/MeetingDetail");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const key = process.env.TOKEN_SECRET_KEY;
const cloudinary = require("../util/cloudinary_config");
const upload = require("../middleware/upload_file");
const fs = require("fs");
const { formatToTimeZone } = require("date-fns-timezone");

const postUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    const checkUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (checkUser) {
      const error = new Error("Email is already registered.");
      error.statusCode = 400;
      throw error;
    }

    //hashed password user
    const hashedPassword = await bcrypt.hash(password, 5);

    //insert data ke tabel users
    await User.create({
      fullName: fullName,
      email,
      password: hashedPassword,
      role,
    });

    //send response
    res.status(201).json({
      status: "success",
      message: "Register Successfull!",
    });
  } catch (error) {
    //jika status code belum terdefined maka status = 500;
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const loginHandler = async (req, res, next) => {
  try {
    // ambil data dari req body
    const { email, password } = req.body;
    const currentUser = await User.findOne({
      where: {
        email: email,
      },
    });
    //apabila user tidak ditemukan
    if (currentUser == undefined) {
      const error = new Error("Wrong email or password!");
      error.statusCode = 400;
      throw error;
    }
    const checkPassword = await bcrypt.compare(password, currentUser.password);

    //apabila password salah / tidak matched
    if (checkPassword === false) {
      const error = new Error("Wrong email or password!");
      error.statusCode = 400;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: currentUser.id,
        role: currentUser.role,
      },
      key,
      {
        algorithm: "HS256",
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      status: "Success",
      message: "Login Successfull!",
      token,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const getUserByToken = async (req, res, next) => {
  try {
    //mengambil header
    const header = req.headers;

    //mengambil header auth
    const authorization = header.authorization;
    console.log(authorization);
    let token;

    if (authorization !== undefined && authorization.startsWith("Bearer ")) {
      //mengilangkan string "Bearer "
      token = authorization.substring(7);
    } else {
      const error = new Error("You need to login to access this page.");
      error.statusCode = 403;
      throw error;
    }
    //step 2 ekstrak payload menggunakan jwt.verify
    const payload = jwt.verify(token, key);

    //step 3 cari user berdasarkan payload.userId
    const userId = payload.userId;
    const user = await User.findOne({
      where: { id: userId },
      attributes: ["id", "fullName", "email", "profilePicture", "role"],
    });

    if (user == undefined) {
      res.status(400).json({
        status: "Error",
        message: `User with id ${userId} doesn't exist!`,
      });
    }
    res.status(200).json({
      status: "Success",
      message: "Succesfully fetch user data",
      user: user,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const editProfile = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const { email, fullName } = req.body;

    //kalau user kosongin jangan diubah di db nya
    if (email == null || fullName == null) {
      const error = new Error("Email and full name can't be empty!");
      error.statusCode = 400;
      throw error;
    }

    let token;
    if (authorization !== null && authorization.startsWith("Bearer ")) {
      token = authorization.substring(7);
    } else {
      const error = new Error("You need to login");
      error.statusCode = 403;
      throw error;
    }
    const decoded = jwt.verify(token, key);
    const currentUser = await User.findOne({
      where: {
        id: decoded.userId,
      },
      attributes: ["id", "fullName", "email", "profilePicture"],
    });
    if (!currentUser) {
      const error = new Error(`User with ID ${decoded.userId} doesn't exist!`);
      error.statusCode = 400;
      throw error;
    }
    let imageUrl;

    //kalau ada gambar diupload dia update profpic, kalo gaada skip
    if (req.file) {
      const file = req.file;
      const uploadOption = {
        folder: "MeetSync_ProfilePic/",
        public_id: `user_${currentUser.id}`,
        overwrite: true,
      };
      const uploadFile = await cloudinary.uploader.upload(
        file.path,
        uploadOption
      );
      imageUrl = uploadFile.secure_url;
      fs.unlinkSync(file.path);
      currentUser.update({
        profilePicture: imageUrl,
      });
    }

    //cek email baru udah kepake atau belum
    const checkUser = await User.findOne({
      where: {
        email: email,
      },
    });
    if (checkUser && checkUser.id != currentUser.id) {
      const error = new Error("Email is already used!");
      error.statusCode = 400;
      throw error;
    }

    //update akun
    currentUser.update({
      fullName,
      email,
    });

    res.status(200).json({
      status: "Success",
      updatedUser: currentUser,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error,
    });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "fullName", "email", "profilePicture", "role"],
    });

    res.status(200).json({
      status: "Success",
      message: "Successfully fetch all user data",
      users: users,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const getTeacherMeetings = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const { teacherId } = req.params;
    let token;
    if (authorization !== null && authorization.startsWith("Bearer ")) {
      token = authorization.substring(7);
    } else {
      const error = new Error("You need to login");
      error.statusCode = 403;
      throw error;
    }
    const decoded = jwt.verify(token, key);
    const currentUser = await User.findOne({
      where: {
        id: decoded.userId,
      },
    });
    if (!currentUser) {
      const error = new Error(`User with ID ${decoded.userId} doesn't exist!`);
      error.statusCode = 400;
      throw error;
    }
    const user = await User.findOne({
      where: {
        id: teacherId,
      },
    });
    if (!user) {
      const error = new Error(`Teacher with ID ${teacherId} doesn't exist!`);
      error.statusCode = 400;
      throw error;
    }
    if (user.role != "Teacher") {
      const error = new Error(`User with ID ${teacherId} is not a teacher!`);
      error.statusCode = 400;
      throw error;
    }
    const meeting = await Meeting.findAll({
      where: {
        teacherId: teacherId,
      },
      attributes: [
        "id",
        "name",
        "description",
        "place",
        "datetime_start",
        "datetime_end",
        "duration_minute",
        "teacherId",
      ],
      include: {
        model: User,
        as: "teacher",
        attributes: ["fullName"],
      },
      raw: true,
    });
    const meetingsWithCorrectTimezone = meeting.map((meeting) => ({
      ...meeting,
      datetime_start: formatToTimeZone(
        meeting.datetime_start,
        "YYYY-MM-DD HH:mm:ss",
        { timeZone: "Asia/Jakarta" }
      ),
      datetime_end: formatToTimeZone(
        meeting.datetime_end,
        "YYYY-MM-DD HH:mm:ss",
        { timeZone: "Asia/Jakarta" }
      ),
    }));
    res.status(200).json({
      status: "Success",
      message: "Successfully fetch all meeting data",
      meeting: meetingsWithCorrectTimezone,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const getTeachersByName = async (req, res, next) => {
  try {
    const { name } = req.query;

    const users = await User.findAll({
      where: {
        fullName: {
          [Op.like]: `%${name}%`,
        },
        role: "Teacher",
      },
    });

    if (users === undefined) {
      res.status(400).json({
        status: "Error",
        message: `Users is not existed!`,
      });
    }

    res.status(200).json({
      status: "Success",
      message: "Succesfully fetch user data",
      user: users,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

module.exports = {
  postUser,
  loginHandler,
  getUserByToken,
  editProfile,
  getAllUsers,
  getTeacherMeetings,
  getTeachersByName,
};
