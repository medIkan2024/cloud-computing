const { where } = require("sequelize");
const Disease = require("../model/DiseaseModel");

const getAllDiseases = async (req, res, next) => {
  try {
    const diseases = await Disease.findAll();

    res.status(200).json({
      status: "Success",
      message: "Successfully fetch all disease data",
      data: diseases,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const getDiseaseById = async (req, res, next) => {
  try {
    const { diseaseId } = req.params;
    const disease = await Disease.findAll({
      where: {
        id: diseaseId,
      },
    });

    if (!disease) {
      const error = new Error(`Disease with ID ${diseaseId} doesn't exist!`);
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: "Success",
      message: `Successfully fetch disease data with ID ${diseaseId}`,
      data: disease,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

module.exports = {
  getAllDiseases,
  getDiseaseById,
};
