/**
 * Middleware untuk check user role
 * @param {string[]} allowedRoles - Array of allowed roles
 */
const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    // Check if user exists (from authMiddleware)
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    // Check if user role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied. Insufficient permissions.",
        requiredRole: allowedRoles,
        yourRole: req.user.role,
      });
    }

    next();
  };
};

/**
 * Admin only middleware
 */
const adminOnly = roleMiddleware(["ADMIN"]);

/**
 * User or Admin middleware
 */
const userOrAdmin = roleMiddleware(["USER", "ADMIN"]);

module.exports = { roleMiddleware, adminOnly, userOrAdmin };
