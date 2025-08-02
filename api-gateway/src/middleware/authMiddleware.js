import jwt from "jsonwebtoken";

export const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (!token) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    console.log("Using secret:", process.env.JWT_SECRET);
    console.log("Decoded user:", user);
    if (err) {
      console.log(err);
      return res.status(429).json({
        message: "Invalid token",
        success: false,
      });
    }
    req.user = user;
    next();
  });
};
