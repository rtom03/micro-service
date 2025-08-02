import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import Redis from "ioredis";
import helmet from "helmet";
import expressRateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import logger from "../../identity-service/src/utils/logger.js";
import proxy from "express-http-proxy";
import errorHandler from "./middleware/errorHandler.js";
import { validateToken } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`),
    logger.info(`Request body, ${req.body}`);
  next();
});

// rate limiting
const rateLimit = expressRateLimit({
  windowMs: 15 * 60 * 100,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP:${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use(rateLimit);

const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error:${err.message}`);
    console.log(err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  },
};

// setting up proxy for our identity service
app.use(
  "/v1/auth",
  proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from identity service: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

// setting up proxy for our post service
app.use(
  "/v1/posts",
  validateToken,
  proxy(process.env.POST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["content-type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from identity service: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API GATEWAY LISTENING ON http://localhost:${PORT}`);
  logger.info(
    `IDENTITY SERVICE LISTENING ON http://localhost:${process.env.IDENTITY_SERVICE_URL}`
  );
  logger.info(
    `POST SERVICE LISTENING ON http://localhost:${process.env.POST_SERVICE_URL}`
  );
  logger.info(
    `REDIS URL LISTENING ON http://localhost:${process.env.REDIS_URL}`
  );
});
