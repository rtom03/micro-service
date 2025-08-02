import express from "express";
import dotenv from "dotenv";
import configureCors from "./config/corsConfig.js";
import { addTimeStamp, requestLogger } from "./middleware/customMiddleware.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";
import { urlVersioning } from "./middleware/apiVersioning.js";
import { createBasicRateLimiter } from "./middleware/rateLimiting.js";
import itemRoutes from "./routes/itemRoutes.js";
import redis from "redis";
import { ioRedisDemo } from "./data-structure/ioredis.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

ioRedisDemo();
app.use(requestLogger);
app.use(addTimeStamp);
app.use(configureCors());
app.use(createBasicRateLimiter(2, 15 * 60 * 1000));
app.use(express.json());

app.use(urlVersioning("v1"));
app.use("/api/v1", itemRoutes);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});
