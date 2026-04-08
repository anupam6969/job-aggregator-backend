import rateLimit, { ipKeyGenerator } from "express-rate-limit";

//  Global limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,

  keyGenerator: (req) => {
    return ipKeyGenerator(req); //
  },

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message: "Too many requests, please try again later",
  },
});

// Login limiter (strict)
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,

  keyGenerator: (req) => {
    return ipKeyGenerator(req); // 
  },

  message: {
    message: "Too many login attempts, try again later",
  },
});

export { globalLimiter, loginLimiter };