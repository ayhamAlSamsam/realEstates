const express = require("express");
const {
  createEstate,
  deleteEstate,
  getAllEstates,
  getEstateById,
  updateEstate,
  updateEstateStatus,
} = require("../controllers/estateOffers.controller");

const AuthRoute = express.Router();

AuthRoute.route("/signup").post(signup);
AuthRoute.route("/login").post(login);
AuthRoute.route("/forgot-password").post(forgotPassword);
AuthRoute.route("/verify-reset-code").post(verifyResetCode);
AuthRoute.route("/reset-password").put(resetPassword);

module.exports = AuthRoute;
