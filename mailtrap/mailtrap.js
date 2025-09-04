import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

// القيم دي لازم تبقى عندك في env
const USER = process.env.EMAIL_USERNAME;
const PASS = process.env.EMAIL_PASSWORD;

if (!USER || !PASS) {
  throw new Error(
    "MAILTRAP_USER or MAILTRAP_PASS is missing in environment variables."
  );
}

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: USER,
    pass: PASS
  }
});

export const sender = {
  name: "My Auth App",
  address: "no-reply@myapp.com"
};

export async function sendEmail(config) {
  return await transport.sendMail(config);
}
