import { rateLimit } from "express-rate-limit";

export const createBasicRateLimiter = (maxRequest, time) => {
  return rateLimit({
    max: maxRequest,
    windowMs: time,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests, please try again ",
  });
};
