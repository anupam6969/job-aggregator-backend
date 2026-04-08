import axios from "axios";
import Job from "../models/job.js";
import normalizeJob from "../utils/normalizeJobs.js";

// Reusable bulk save function
const saveJobs = async (jobs, source) => {
  try {
    const operations = [];

    for (let job of jobs) {
      const normalized = normalizeJob(job, source);

      if (!normalized || !normalized.url) continue;

      operations.push({
        updateOne: {
          filter: { url: normalized.url },
          update: { $set: normalized },
          upsert: true
        }
      });
    }

    if (operations.length > 0) {
      await Job.bulkWrite(operations);
      console.log(` ${source}: ${operations.length} jobs saved`);
    } else {
      console.log(` ${source}: No valid jobs found`);
    }

  } catch (error) {
    console.error(`${source} DB Error:`, error.message);
  }
};

//  RemoteOK
const fetchFromRemoteOK = async () => {
  try {
    console.log("Fetching from RemoteOK...");

    const { data } = await axios.get("https://remoteok.com/api", {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      timeout: 10000
    });

    // Skip first metadata object
    const jobs = Array.isArray(data) ? data.slice(1) : [];

    await saveJobs(jobs, "RemoteOK");

  } catch (error) {
    console.error("RemoteOK Error:", error.message);
  }
};

// Remotive
const fetchFromRemotive = async () => {
  try {
    console.log("Fetching from Remotive...");

    const { data } = await axios.get(
      "https://remotive.com/api/remote-jobs",
      { timeout: 10000 }
    );

    const jobs = data?.jobs || [];

    await saveJobs(jobs, "Remotive");

  } catch (error) {
    console.error("Remotive Error:", error.message);
  }
};

//  Arbeitnow
export const fetchFromArbeitnow = async () => {
  try {
    console.log("Fetching from Arbeitnow...");

    const { data } = await axios.get(
      "https://www.arbeitnow.com/api/job-board-api",
      { timeout: 10000 }
    );

    const jobs = data?.data || [];

    await saveJobs(jobs, "Arbeitnow");

  } catch (error) {
    console.error("Arbeitnow Error:", error.message);
  }
};

// Run all in parallel
export const fetchAllJobs = async () => {
  try {
    console.log("Fetching from all sources...");

    await Promise.all([
      fetchFromRemoteOK(),
      fetchFromRemotive(),
      fetchFromArbeitnow()
    ]);

    console.log("All sources completed successfully");

  } catch (error) {
    console.error("Error in fetchAllJobs:", error.message);
  }
};