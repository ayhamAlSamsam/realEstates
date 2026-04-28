const express = require("express");
const {
  createRequest,
  deleteRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  updateRequestStatus,
  matchRequestWithOffers,
} = require("../controllers/estateRequest.controller");

const estateRequestsRoute = express.Router();

estateRequestsRoute.route("/").post(createRequest).get(getAllRequests);
estateRequestsRoute.route("/match-offers/:id").get(matchRequestWithOffers);

estateRequestsRoute
  .route("/:id")
  .get(getRequestById)
  .patch(updateRequest)
  .delete(deleteRequest);
estateRequestsRoute.route("/:id/status").put(updateRequestStatus);

module.exports = estateRequestsRoute;
