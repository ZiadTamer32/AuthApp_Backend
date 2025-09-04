import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const USER = process.env.EMAIL_USERNAME;
const PASS = process.env.EMAIL_PASSWORD;

if (!USER || !PASS) {
  throw new Error("USER or PASS is missing in environment variables.");
}

const transport = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: USER,
    pass: PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sender = {
  name: "My Auth App",
  address: USER,
};

export async function sendEmail(config) {
  return await transport.sendMail(config);
}
