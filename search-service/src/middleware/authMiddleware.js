const authenticateRequest = (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication Failed",
    });
  }
  req.user = { userId };
  next();
};

export default authenticateRequest;
