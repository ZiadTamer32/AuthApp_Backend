import express from "express";
import {
  signup,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  protectedRoute,
  checkAuth
} from "../services/authServices.js";
import {
  resetPasswordValidator,
  signupValidator,
  verifyEmailValidator
} from "../utils/validators/authValidator.js";
const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login", login);
router.post("/verify-email", verifyEmailValidator, verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPasswordValidator, resetPassword);
router.post("/logout", logout);
router.get("/checkAuth", protectedRoute, checkAuth);

export default router;
