import { check } from "express-validator";
import ErrorValidator from "../ErrorValidator.js";
import UserModel from "../../models/userModel.js";

export const signupValidator = [
  check("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),
  check("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required")
    .custom(async (value) => {
      const user = await UserModel.findOne({ email: value });
      if (user) {
        throw new Error("Email already exists");
      }
    }),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[!@#$%^&*]/)
    .withMessage("Password must contain a special character"),
  ErrorValidator,
];
export const verifyEmailValidator = [
  check("verification_token")
    .trim()
    .notEmpty()
    .withMessage("Token is required"),
  ErrorValidator,
];

export const resetPasswordValidator = [
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[!@#$%^&*]/)
    .withMessage("Password must contain a special character"),
  ErrorValidator,
];
