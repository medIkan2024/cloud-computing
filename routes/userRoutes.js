const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {
  registerHandler,
  loginHandler,
  getUserInfo,
  editAccountHandler,
  editProfilePictureHandler,
  addUserHistory,
  getUserHistory,
} = require("../controller/userController");

// register
router.post("/users/register", registerHandler);

// login
router.post("/users/login", loginHandler);

// get user info
router.get("/users", getUserInfo);

// edit account
router.put("/users/edit-account", editAccountHandler);

// edit profile picture
router.put(
  "/users/edit-profile-picture",
  upload.single("image"),
  editProfilePictureHandler
);

// menambah history
router.post("/users/history", addUserHistory);

// mengambil history
router.get("/users/history/:userId", getUserHistory);

module.exports = router;
