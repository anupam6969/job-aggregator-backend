import axios from "axios";
import Job from "../models/job.js";
import normalizeJob from "../utils/normalizeJobs.js";

// Reusable bulk save function
const saveJobs = async (jobs, source) => {
  const operations = [];

  for (const job of jobs) {
    const normalized = normalizeJob(job, source);

    if (!normalized || !normalized.url) {
      continue;
    }

    operations.push({
      updateOne: {
        filter: { url: normalized.url },
        update: { $set: normalized },
        upsert: true
      }
    });
  }

  if (operations.length === 0) {
    console.log(` ${source}: No valid jobs found`);
    return 0;
  }

  await Job.bulkWrite(operations);
  console.log(` ${source}: ${operations.length} jobs saved`);

  return operations.length;
};

// RemoteOK
const fetchFromRemoteOK = async () => {
  console.log("Fetching from RemoteOK...");

  try {
    const { data } = await axios.get("https://remoteok.com/api", {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      timeout: 10000
    });

    const jobs = Array.isArray(data) ? data.slice(1) : [];
    const saved = await saveJobs(jobs, "RemoteOK");

    return { source: "RemoteOK", saved };
  } catch (error) {
    throw new Error(`RemoteOK failed: ${error.message}`);
  }
};

// Remotive
const fetchFromRemotive = async () => {
  console.log("Fetching from Remotive...");

  try {
    const { data } = await axios.get(
      "https://remotive.com/api/remote-jobs",
      { timeout: 10000 }
    );

    const jobs = data?.jobs || [];
    const saved = await saveJobs(jobs, "Remotive");

    return { source: "Remotive", saved };
  } catch (error) {
    throw new Error(`Remotive failed: ${error.message}`);
  }
};

// Arbeitnow
export const fetchFromArbeitnow = async () => {
  console.log("Fetching from Arbeitnow...");

  try {
    const { data } = await axios.get(
      "https://www.arbeitnow.com/api/job-board-api",
      { timeout: 10000 }
    );

    const jobs = data?.data || [];
    const saved = await saveJobs(jobs, "Arbeitnow");

    return { source: "Arbeitnow", saved };
  } catch (error) {
    throw new Error(`Arbeitnow failed: ${error.message}`);
  }
};

// Run all in parallel
export const fetchAllJobs = async () => {
  console.log("Fetching from all sources...");

  const results = await Promise.allSettled([
    fetchFromRemoteOK(),
    fetchFromRemotive(),
    fetchFromArbeitnow()
  ]);

  const successfulSources = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

  const failedSources = results
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason.message);

  if (failedSources.length > 0) {
    const error = new Error(`Job fetch completed with failures: ${failedSources.join("; ")}`);
    error.results = {
      successfulSources,
      failedSources
    };

    throw error;
  }

  console.log("All sources completed successfully");

  return successfulSources;
};
