import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import Redis from "ioredis";
import postRoutes from "./routes/postRoutes.js";
import logger from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import expressRateLimit from "express-rate-limit";
// import { RedisStore } from "rate-limit-redis";

dotenv.config();

const PORT = process.env.PORT;

const app = express();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connection to database established"))
  .catch((e) => logger.error("Database connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);

//middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// app.use((req, res, next) => {
//   rateLimter
//     .consume(req.ip)
//     .then(() => next())
//     .catch((e) => {
//       logger.warn(`Rate limit exceeded fro IP:${req.ip}`);
//       res.status(429).json({ success: false, message: "Too many requests" });
//     });
// });

//routes -->

app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes
);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`server listening on on http://localhost:${PORT}`);
});
