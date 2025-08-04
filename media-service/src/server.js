import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import Redis from "ioredis";
import mediaRoutes from "./routes/mediaRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { connectRabbitMQ, consumeEvent } from "./utils/rabbitmq.js";
import { handlePostDeleted } from "./eventHandlers/mediaEventHandlers.js";

dotenv.config();

const PORT = process.env.PORT;

const app = express();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connection to database established"))
  .catch((e) => console.log("Database connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/media", mediaRoutes);
app.use(errorHandler);

async function startServer() {
  try {
    await connectRabbitMQ();
    // consume events
    await consumeEvent("post.deleted", handlePostDeleted);

    app.listen(PORT, () => {
      console.log(`server listening on on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

startServer();
