const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} = require("../services/auth.service");

const AuthRoute = express.Router();

AuthRoute.route("/signup").post(signup);
AuthRoute.route("/login").post(login);
AuthRoute.route("/forgot-password").post(forgotPassword);
AuthRoute.route("/verify-reset-code").post(verifyResetCode);
AuthRoute.route("/reset-password").post(resetPassword);

module.exports = AuthRoute;
