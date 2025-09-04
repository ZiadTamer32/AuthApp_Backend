import {
  sendResetEmail,
  sendResetToken,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/emails.js";
import UserModel from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcryptjs.hash(password, 10);

    const verficationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      verification_token: verficationToken,
      verification_token_expire_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not created" });
    }

    const token = generateToken(user._id, res);

    await sendVerificationEmail(user.email, verficationToken);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        last_login: user.last_login,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ sucess: false, message: err.message || "Something went wrong" });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { verification_token } = req.body;

    const user = await UserModel.findOne({
      verification_token,
      verification_token_expire_at: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Invalid or expired token" });

    user.isVerified = true;
    user.verification_token = undefined;
    user.verification_token_expire_at = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Invalid credentials" });
    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id, res);

    user.last_login = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        last_login: user.last_login,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}
export async function logout(req, res) {
  try {
    res.clearCookie("Auth-Token", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      // Do not reveal user existence
      return res.status(200).json({
        success: true,
        message:
          "If an account exists for this email, a reset link has been sent",
      });
    }

    // Generate raw token
    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    await user.save();

    try {
      await sendResetToken(
        user.email,
        `${process.env.CLIENT_URL}/reset-password/${resetToken}`
      );
    } catch (err) {
      // Roll back token if email sending fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      throw err;
    }

    return res.status(200).json({
      success: true,
      message:
        "If an account exists for this email, a reset link has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
}
export async function resetPassword(req, res) {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const user = await UserModel.findOne({
      resetPasswordToken: token,
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const compareWithOldPassword = await bcryptjs.compare(
      password,
      user.password
    );
    if (compareWithOldPassword)
      return res
        .status(400)
        .json({ message: "Password cannot be the same as the old one" });

    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    await sendResetEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password reseted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}

export async function protectedRoute(req, res, next) {
  try {
    const token = req.cookies["Auth-Token"];
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - no token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - invalid token" });

    const user = await UserModel.findById(decoded.id);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - User not found" });

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in verifyToken ", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function checkAuth(req, res) {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        last_login: user.last_login,
      },
    });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
}
