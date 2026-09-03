const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization") || req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. No Token Provided",
      });
    }

    // Support "Bearer <token>" or raw token
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. Token is empty",
      });
    }

    const secret = process.env.JWT_SECRET || "attendsync_super_secret_jwt_key_2026_secure";
    const verified = jwt.verify(token, secret);

    req.user = verified;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === "TokenExpiredError" ? "Token Expired. Please login again." : "Invalid Token",
    });
  }
};

// Admin Role Authorization Middleware
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access Forbidden. Admin privileges required.",
    });
  }
  next();
};

// Faculty Admin or Admin — allows both admin and faculty_admin roles (dashboard access)
const facultyAdminOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "faculty_admin")) {
    return res.status(403).json({
      success: false,
      message: "Access Forbidden. Faculty or Admin privileges required.",
    });
  }
  next();
};

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.adminOnly = adminOnly;
module.exports.facultyAdminOrAdmin = facultyAdminOrAdmin;
