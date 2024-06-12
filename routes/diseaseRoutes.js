const express = require("express");
const router = express.Router();

const {
  getAllDiseases,
  getDiseaseById,
} = require("../controller/diseaseController");

// get all disease data
router.get("/disease", getAllDiseases);

// get disease data by id
router.get("/disease/:diseaseId", getDiseaseById);

module.exports = router;
