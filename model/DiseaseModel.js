const sequelize = require("../util/db_connect.js");
const Sequelize = require("sequelize");

const Disease = sequelize.define("diseases", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  treatment: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  image: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  reference: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

module.exports = Disease;
