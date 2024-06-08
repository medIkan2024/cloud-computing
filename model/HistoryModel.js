const sequelize = require("../util/db_connect.js");
const Sequelize = require("sequelize");

const History = sequelize.define(
  "history",
  {
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
    image: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = History;
