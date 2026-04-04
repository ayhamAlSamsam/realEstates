// controllers/authController.js
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const ApiError = require("../utils/apiError");

// ========== Helper Functions (inside) ==========
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const comparePassword = async (candidate, hashed) => {
  return await bcrypt.compare(candidate, hashed);
};

const createToken = (userId, email, authSource = "user") => {
  return jwt.sign({ userId, email, authSource }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME || "90d",
  });
};

const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ========== 1. SIGNUP ==========
exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError("User already exists", 400));
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
  });

  user.password = undefined;

  res.status(201).json({
    status: "success",
    message: "User created successfully. Please login.",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
});

// ========== 2. LOGIN ==========
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ApiError("Invalid email or password", 401));
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return next(new ApiError("Invalid email or password", 401));
  }

  const token = createToken(user._id, user.email, "user");
  user.password = undefined;

  res.status(200).json({
    status: "success",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
    token,
  });
});

// ========== 3. FORGOT PASSWORD ==========
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  const resetCode = generateResetCode();
  console.log("Reset Code:", resetCode);

  const hashedCode = await hashPassword(resetCode);
  user.passwordResetCode = hashedCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.resetCodeVerified = false;
  await user.save();

  const message = `Hello ${user.name},\n\nYour password reset code is: ${resetCode}\n\nValid for 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Code",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Reset code sent to your email",
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.resetCodeVerified = undefined;
    await user.save();

    return next(new ApiError("Error sending email", 500));
  }
});

// ========== 4. VERIFY RESET CODE ==========
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  const { email, resetCode } = req.body;

  if (!email || !resetCode) {
    return next(new ApiError("Email and reset code are required", 400));
  }

  const user = await User.findOne({
    email,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Reset code is invalid or expired", 400));
  }

  const isValid = await comparePassword(resetCode, user.passwordResetCode);
  if (!isValid) {
    return next(new ApiError("Invalid reset code", 400));
  }

  user.resetCodeVerified = true;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Reset code verified successfully",
  });
});

// ========== 5. RESET PASSWORD ==========
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return next(new ApiError("Email and new password are required", 400));
  }

  const user = await User.findOne({ email });

  if (!user || !user.resetCodeVerified) {
    return next(
      new ApiError("Reset code not verified. Please request a new code.", 400),
    );
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.resetCodeVerified = undefined;
  await user.save();

  const token = createToken(user._id, user.email, "user");

  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
    token,
  });
});

// ========== 6. PROTECT MIDDLEWARE ==========
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError("Not logged in", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (decoded.authSource !== "user") {
      return next(new ApiError("Invalid token source", 403));
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new ApiError("User no longer exists", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ApiError("Token expired", 401));
    }
    return next(new ApiError("Invalid token", 401));
  }
});
