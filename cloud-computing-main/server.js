require("dotenv").config();
const express = require("express");
const app = express();
const googleAuthRouter = require("./routes/googleAuthRoutes");
const userRouter = require("./routes/userRoutes");
const association = require("./util/db_assoc");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, DELETE, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(userRouter);
app.use(googleAuthRouter);

app.get("/", (req, res, next) => {
  res.json({
    message: "Connected",
  });
});

association()
  .then(() => {
    app.listen(process.env.PORT || 8080, "0.0.0.0");
    console.log("Connected to http://localhost:8080");
  })
  .catch((e) => {
    console.log(e);
  });
