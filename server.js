import express from "express";

import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import jobRoutes from "./routes/jobRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { startCronJobs } from "./services/cronService.js";
import helmet from "helmet";



dotenv.config();

const app = express();

// Helmet (secure headers)
app.use(helmet());

// CORS restriction
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// body parser
app.use(express.json());

// Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    startCronJobs();

    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  } catch (error) {
    console.error("Server failed to start", error);
    process.exit(1);
  }
};

startServer();

