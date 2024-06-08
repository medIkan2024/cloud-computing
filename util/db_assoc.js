const sequelize = require("./db_connect");
const User = require("../model/UserModel");
const Disease = require("../model/DieseaseModel");
const diseases = require("../model/DiseasesData");

const association = async () => {
  try {
    await sequelize.sync({ force: false });
    // await Disease.bulkCreate(diseases);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = association;
