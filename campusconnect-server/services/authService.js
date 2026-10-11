const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const BCRYPT_COST = 12;

async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(BCRYPT_COST);
  return bcrypt.hash(plainPassword, salt);
}

async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

module.exports = { hashPassword, comparePassword, generateToken };
