
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    console.log("Auth cookie received:", Boolean(token));

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Login cookie not found. Please login again.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    console.log("Authenticated user:", decoded.email);

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Unauthorized access. Please login again.",
    });
  }
};

export default authMiddleware;
