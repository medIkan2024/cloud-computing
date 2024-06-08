require("dotenv").config();
const User = require("../model/UserModel");
const History = require("../model/HistoryModel");
const { Op, where, Model } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const key = process.env.TOKEN_SECRET_KEY;
const bucket = require("../util/storage_connect");
const Disease = require("../model/DiseaseModel");

const registerHandler = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

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

    //hash password user
    const hashedPassword = await bcrypt.hash(password, 5);

    //insert data ke tabel users
    await User.create({
      // username: username.replace(/\s+/g, "").toLowerCase(),
      username,
      email,
      password: hashedPassword,
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
    const { email, password } = req.body;
    const currentUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (currentUser == undefined) {
      const error = new Error("Wrong email or password!");
      error.statusCode = 400;
      throw error;
    }

    const checkPassword = await bcrypt.compare(password, currentUser.password);

    if (checkPassword === false) {
      const error = new Error("Wrong email or password!");
      error.statusCode = 400;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: currentUser.id,
      },
      key,
      {
        algorithm: "HS256",
        expiresIn: "6h",
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

const getUserInfo = async (req, res, next) => {
  try {
    const header = req.headers;

    // mengambil header auth
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
      attributes: ["id", "username", "email", "profilePicture"],
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

const editAccountHandler = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const { email, username } = req.body;

    if (!email || !username) {
      const error = new Error("Email and full name can't be empty!");
      error.statusCode = 400;
      throw error;
    }

    let token;
    if (authorization && authorization.startsWith("Bearer ")) {
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
      attributes: ["id", "username", "email", "profilePicture"],
    });

    if (!currentUser) {
      const error = new Error(`User with ID ${decoded.userId} doesn't exist!`);
      error.statusCode = 400;
      throw error;
    }

    const checkUser = await User.findOne({ where: { email } });

    if (checkUser && checkUser.id !== currentUser.id) {
      const error = new Error("Email is already used!");
      error.statusCode = 400;
      throw error;
    }

    await currentUser.update({
      username,
      email,
    });

    res.status(200).json({
      status: "Success",
      updatedUser: currentUser,
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message || "Internal Server Error",
    });
  }
};

const editProfilePictureHandler = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    let token;
    if (authorization && authorization.startsWith("Bearer ")) {
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
      attributes: ["id", "username", "email", "profilePicture"],
    });

    if (!currentUser) {
      const error = new Error(`User with ID ${decoded.userId} doesn't exist!`);
      error.statusCode = 400;
      throw error;
    }

    if (req.file) {
      try {
        const file = req.file;
        const fileExtension = file.originalname.split(".").pop();
        const blob = bucket.file(`${decoded.userId}.${fileExtension}`);
        const blobStream = blob.createWriteStream();
        blobStream.on("error", (err) => {
          const error = new Error("Image Failed to Upload");
          error.status = 500;
          throw error;
        });
        blobStream.on("finish", async () => {
          await blob.makePublic();
          const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          await currentUser.update({
            profilePicture: imageUrl,
          });
        });
        blobStream.end(file.buffer);
      } catch (error) {
        console.log(error);
      }
    } else {
      const error = new Error("Image is empty!");
      error.status = 400;
      throw error;
    }
    res.status(200).json({
      status: "Success",
      message: "Succesfully update user profile",
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message || "Internal Server Error",
    });
  }
};

const addUserHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { name, image, diseaseId } = req.body;

    if (!name || !image || !diseaseId) {
      const error = new Error("Data can't be empty!");
      error.statusCode = 400;
      throw error;
    }

    const currentUser = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!currentUser) {
      const error = new Error(`User with ID ${userId} doesn't exist!`);
      error.statusCode = 400;
      throw error;
    }

    await History.create({
      name,
      image,
      userId,
      diseaseId,
    });

    res.status(200).json({
      status: "Success",
      message: "Sucessfully added to history",
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message || "Internal Server Error",
    });
  }
};

const getUserHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!currentUser) {
      const error = new Error(`User with ID ${userId} doesn't exist!`);
      error.statusCode = 400;
      throw error;
    }

    const historyData = await History.findAll({
      where: {
        userId: userId,
      },
      include: {
        model: Disease,
        attributes: ["name", "description", "treatment"],
      },
      attributes: ["id", "name", "image", "createdAt"],
    });

    res.status(200).json({
      status: "Success",
      message: "Sucessfully get user history",
      data: historyData,
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = {
  registerHandler,
  loginHandler,
  getUserInfo,
  editAccountHandler,
  editProfilePictureHandler,
  addUserHistory,
  getUserHistory,
};
