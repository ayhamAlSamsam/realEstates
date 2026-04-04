const express = require("express");
const {
  createEstate,
  deleteEstate,
  getAllEstates,
  getEstateById,
  updateEstate,
  updateEstateStatus,
} = require("../controllers/estateOffers.controller");

const estateOffersRoute = express.Router();

estateOffersRoute.route("/").post(createEstate).get(getAllEstates);
estateOffersRoute
  .route("/:id")
  .get(getEstateById)
  .patch(updateEstate)
  .delete(deleteEstate);
estateOffersRoute.route("/:id/status").put(updateEstateStatus);
module.exports = estateOffersRoute;
