function sanitizeUser(userDoc) {
  const obj = userDoc.toObject ? userDoc.toObject() : userDoc;
  const { password, ...safe } = obj;
  return safe;
}

module.exports = { sanitizeUser };
