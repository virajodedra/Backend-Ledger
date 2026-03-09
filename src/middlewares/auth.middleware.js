import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import tokenBlackListModel from "../models/blacklist.model.js";

async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      status: "failed",
      message: "Unauthorized access, token missing",
    });
  }

  const isBlackListed = await tokenBlackListModel.find({ token });
  if (isBlackListed && isBlackListed.length > 0) {
    return res.status(401).json({
      success: false,
      status: "failed",
      message: "Unauthorized access, token is blacklisted",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        status: "failed",
        message: "Unauthorized access, user not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      status: "failed",
      message: "Unauthorized access, invalid token",
    });
  }
}

async function authSystemUserMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      status: "failed",
      message: "Unauthorized access, token missing",
    });
  }

  const isBlackListed = await tokenBlackListModel.find({ token });
  if (isBlackListed && isBlackListed.length > 0) {
    return res.status(401).json({
      success: false,
      status: "failed",
      message: "Unauthorized access, token is blacklisted",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId).select("+systemUser");

    if (!user) {
      return res.status(401).json({
        success: false,
        status: "failed",
        message: "Unauthorized access, user not found",
      });
    }

    if (!user.systemUser) {
      return res.status(403).json({
        success: false,
        status: "failed",
        message: "Forbidden access, user is not a system user",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      status: "failed",
      message: "Unauthorized access, invalid token",
    });
  }
}

export default { authMiddleware, authSystemUserMiddleware };
