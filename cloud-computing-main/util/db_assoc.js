const sequelize = require("./db_connect");
const User = require("../model/UserModel");
const History = require("../model/HistoryModel");
const Disease = require("../model/DiseaseModel");
const diseases = require("../model/DiseasesData");

User.hasMany(History);
History.belongsTo(User);

History.belongsTo(Disease);
Disease.hasMany(History);

const association = async () => {
  try {
    await sequelize.sync({ force: false });
    // await Disease.bulkCreate(diseases);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = association;
