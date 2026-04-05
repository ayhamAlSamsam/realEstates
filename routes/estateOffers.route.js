const express = require("express");
const {
  createEstate,
  deleteEstate,
  getAllEstates,
  getEstateById,
  updateEstate,
  updateEstateStatus,
} = require("../controllers/estateOffers.controller");

const { uploadEstateFiles } = require("../middlewares/uploadingImage");
const estateOffersRoute = express.Router();

estateOffersRoute
  .route("/")
  .post(uploadEstateFiles, createEstate)
  .get(getAllEstates);
estateOffersRoute
  .route("/:id")
  .get(getEstateById)
  .patch(uploadEstateFiles, updateEstate)
  .delete(deleteEstate);
estateOffersRoute.route("/:id/status").put(updateEstateStatus);
module.exports = estateOffersRoute;
