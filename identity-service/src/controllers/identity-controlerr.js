import { validateInput } from "../utils/validation.js";
import logger from "./../utils/logger.js";
import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { error } from "console";
import { RefreshToken } from "../models/RefreshToken.js";
// User registration
const registerUser = async (req, res) => {
  logger.info("Registration endpoint initiated...", req);
  try {
    // validate schema
    const { error } = validateInput(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res
        .status(404)
        .json({ success: false, message: error.details[0].message });
    }

    const { email, username, password } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.info("User already exist");
      return res
        .status(404)
        .json({ success: false, message: "User already exist" });
    }

    user = new User({ email, username, password });
    await user.save();
    logger.warn("New User created successfully", user._id);
    const { accessToken, refreshToken } = generateToken(user);
    return res.status(200).json({
      success: true,
      message: "New User created successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Registration error occured", error);
    res
      .status(500)
      .json({ success: false, message: "an error occured while registering" });
  }
};

// User login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  logger.info("Login endpoint initiated...");
  try {
    const { email, username } = validateInput(error);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res
        .status(404)
        .json({ success: false, message: error.details[0].message });
    }
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Invalid user details");
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    //user valid password or not
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Invalid password");
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }
    const { accessToken, refreshToken } = await generateToken(user);
    res.json({
      accessToken,
      refreshToken,
      userId: user._id,
    });
  } catch (error) {
    logger.error("");
  }
};

// Refresh token
const userRefreshToken = async (req, res) => {
  logger.info("RefreshToken endpoint initiated...");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("refresh token missing");
      return res
        .status(400)
        .json({ success: false, message: "refresh token missing" });
    }

    const StoredToken = await RefreshToken.findOne(refreshToken);
    if (!StoredToken || StoredToken.expiresAt < new Date()) {
      logger.warn("Invalid or expired  refresh token");
      return res
        .status(401)
        .json({ success: false, message: "invalid or expired refresh token" });
    }

    const user = await User.findById(StoredToken.user);

    if (!user) {
      logger.warn("User not found");
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateToken(user);

    //delete the old refresh token
    await RefreshToken.deleteOne({ _id: StoredToken._id });
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("Refresh token error occured", error);
    res
      .status(500)
      .json({ success: false, message: "an error occured while registering" });
  }
};

// logout
const userLogout = async (req, res) => {
  logger.info("Logout endpoint initiated...");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("refresh token missing");
      return res
        .status(400)
        .json({ success: false, message: "refresh token missing" });
    }

    await RefreshToken.deleteOne({ token: refreshToken });
    logger.info("Refresh token deleted for logout");

    res.json({
      success: "true",
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error("logout error occured", error);
    res
      .status(500)
      .json({ success: false, message: "an error occured while logging out" });
  }
};

export { registerUser, loginUser, userRefreshToken, userLogout };
