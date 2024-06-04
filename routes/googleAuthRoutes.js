require("dotenv").config();
const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const User = require("../model/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const key = process.env.TOKEN_SECRET_KEY;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:8080/auth/google/callback"
);

const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});

// GOOGLE Login
router.get("/auth/google", (req, res) => {
  res.redirect(authorizationUrl);
});

// GOOGLE callback login
router.get("/auth/google/callback", async (req, res) => {
  try {
    const { code } = req.query;

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    if (!data) {
      return res.json({
        error: "Unable to retrieve user information",
      });
    }

    // Pastikan data yang diambil dari Google tidak null
    const email = data.email || "";
    const username = data.name || "";
    const picture = data.picture || "";

    // Validasi jika email atau username kosong
    if (!email || !username) {
      return res.status(400).json({
        error: "Email or username is missing from Google account data",
      });
    }

    let user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash("12345678", 10);
      user = await User.create({
        username: username,
        email: email,
        password: hashedPassword,
        profilePicture: picture,
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      key,
      {
        algorithm: "HS256",
        expiresIn: "6h",
      }
    );

    return res.status(200).json({
      status: "Success",
      message: "Login Successfull!",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
