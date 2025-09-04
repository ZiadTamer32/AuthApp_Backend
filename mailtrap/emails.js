import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE
} from "./emailTemplates.js";
import { sendEmail, sender } from "./mailtrap.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const response = await sendEmail({
      from: sender,
      to: email,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification"
    });
    console.log("Email sent successfully", response);
  } catch (error) {
    console.error(`Error sending verification`, error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email, userName) => {
  try {
    const response = await sendEmail({
      from: sender,
      to: email,
      subject: "Welcome to Our App",
      html: WELCOME_EMAIL_TEMPLATE.replace("{name}", userName).replace(
        "{appUrl}",
        "http://localhost:5173"
      ),
      category: "Welcome Email"
    });
    console.log("Email sent successfully", response);
  } catch (error) {
    console.error(`Error sending welcome email`, error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendResetToken = async (email, resetURL) => {
  try {
    const response = await sendEmail({
      from: sender,
      to: email,
      subject: "Password Reset Request",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset"
    });
    console.log("Reset email sent successfully", response);
  } catch (error) {
    console.error(`Error sending reset email`, error);
    throw new Error(`Error sending reset email: ${error}`);
  }
};
export const sendResetEmail = async (email) => {
  try {
    const response = await sendEmail({
      from: sender,
      to: email,
      subject: "Password reseted successfully",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset"
    });
    console.log("Reset email sent successfully", response);
  } catch (error) {
    console.error(`Error sending reset email`, error);
    throw new Error(`Error sending reset email: ${error}`);
  }
};
