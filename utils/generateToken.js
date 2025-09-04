import jwt from "jsonwebtoken";
function generateToken(userId, res) {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.cookie("Auth-Token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    maxAge: 90 * 24 * 60 * 60 * 1000,
  });
  return token;
}

export default generateToken;
