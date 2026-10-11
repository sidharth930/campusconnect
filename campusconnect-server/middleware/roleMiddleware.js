function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access restricted to: ${allowedRoles.join(", ")}` });
    }
    next();
  };
}

module.exports = roleMiddleware;
