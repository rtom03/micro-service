const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get("User-Agent");
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
  next();
};

const addTimeStamp = (req, res, next) => {
  req.timestamp = new Date().toISOString();
  next();
};

export { requestLogger, addTimeStamp };
