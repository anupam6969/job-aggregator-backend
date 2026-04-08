import cron from "node-cron";
import { fetchAllJobs } from "./scraper.js";
import dotenv from "dotenv";

dotenv.config();

export const startCronJobs = () => {
  console.log("🟢 Cron Service Started...");
  console.log(`⏰ Cron scheduled: ${process.env.CRON_TIME}`);

  // Run once (non-blocking)
  fetchAllJobs().catch(err =>
    console.error("❌ Initial scrape failed:", err.message)
  );

  // Schedule job
  cron.schedule(process.env.CRON_TIME, async () => {
    console.log("⏰ Running job scraper...");

    try {
      await fetchAllJobs();
      console.log("✅ Cron job completed");
    } catch (err) {
      console.error("❌ Cron job failed:", err.message);
    }
  });
};