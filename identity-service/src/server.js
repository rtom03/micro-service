import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import logger from "./utils/logger.js";
import helmet from "helmet";
import cors from "cors";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { RedisStore } from "rate-limit-redis";
import Redis from "ioredis";
import expressRateLimit from "express-rate-limit";
import { router } from "./routes/identity-service.js";
import { errorHandler } from "./middleware/errorHandler.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connection to database established"))
  .catch((e) => logger.error("Database connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);

//middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`),
    logger.info(`Request body, ${req.body}`);
  next();
});

// DDOS attack protection
const rateLimter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

app.use((req, res, next) => {
  rateLimter
    .consume(req.ip)
    .then(() => next())
    .catch((e) => {
      logger.warn(`Rate limit exceeded fro IP:${req.ip}`);
      res.status(429).json({ success: false, message: "Too many requests" });
    });
});

// ip based rate limiting for sensitive endpoints
const sensitiveEndpointLimiter = expressRateLimit({
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

//apply this sensitive endpoint limiter

app.use("/api/auth/register", sensitiveEndpointLimiter);

// Routes

app.use("/api/auth", router);

// error handler

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`IDENTITY SERVICE RUNNING ON http://localhost:${PORT}`);
});

// process.on(`unhandledRejection`, (reason, Promise) => {
//   logger.error("Unhandled Rejection at", Promise, "reason:", reason);
// });
