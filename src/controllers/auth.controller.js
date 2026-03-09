import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import emailService from "../services/email.service.js";
import tokenBlackListModel from "../models/blacklist.model.js";

/**
 * @desc    User Registration Controller
 * @route   POST /api/auth/register
 * @access  Public
 */
async function userRegisterController(req, res) {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        status: "failed",
        message: "All fields are required",
      });
    }

    const isEmailExists = await userModel.findOne({ email });
    if (isEmailExists) {
      return res.status(422).json({
        success: false,
        status: "failed",
        message: "The account already exists with this email address",
      });
    }

    const user = await userModel.create({
      email,
      password,
      name,
    });

    const token = jwt.sign(
      { userId: user._id, email: email },
      process.env.JWT_SECRET,
      {
        expiresIn: "4h",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({
      success: true,
      status: "success",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
      message: "User registered successfully",
    });

    await emailService.SendRegistrationEmail(user.email, user.name);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      status: "failed",
      message: error.message || "Internal server error",
    });
  }
}

/**
 * @desc User Login Controller
 * @route POST /api/auth/login
 * @access Public
 */

async function userLoginController(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      status: "failed",
      message: "All fields are required",
    });
  }

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({
      success: false,
      status: "failed",
      message: "Invalid email or password",
    });
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      status: "failed",
      message: "Invalid password",
    });
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "4h",
    },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    success: true,
    status: "success",
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
    message: "User logged in successfully",
  });
}

/**
 * @desc    User Logout Controller
 * @route   POST /api/auth/logout
 * @access  Private
 */
async function userLogoutController(req, res) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(200).json({
      success: true,
      status: "success",
      message: "User logged out successfully",
    });
  }

  res.clearCookie("token");
  await tokenBlackListModel.create({ token });

  res.status(200).json({
    success: true,
    status: "success",
    message: "User logged out successfully",
  });
}

export default {
  userRegisterController,
  userLoginController,
  userLogoutController,
};
