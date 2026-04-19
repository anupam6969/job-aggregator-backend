import Job from "../models/job.js";

const parsePositiveInt = (value, fallback, max) => {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  if (typeof max === "number") {
    return Math.min(parsed, max);
  }

  return parsed;
};

// Get all jobs (with filters + pagination)
export const jobs = async (req, res) => {
  try {
    let { title, location, page = 1, limit = 20 } = req.query;

    // ✅ Sanitize inputs
    page = parsePositiveInt(page, 1);
    limit = parsePositiveInt(limit, 20, 50);

    const filter = {};

    // Safe regex (escape special chars)
    const escapeRegex = (text) =>
      text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (title) {
      filter.title = {
        $regex: escapeRegex(title),
        $options: "i"
      };
    }

    if (location) {
      filter.location = {
        $regex: escapeRegex(location),
        $options: "i"
      };
    }

    const skip = (page - 1) * limit;

    // Query with projection (faster)
    const jobs = await Job.find(filter)
      .select("title company location url source postedAt")
      .sort({ postedAt: -1 }) // 🔥 important fix
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(filter);

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      jobs
    });

  } catch (error) {
    console.error("Jobs Fetch Error:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};


// Get latest jobs (last 24 hours)
export const getLatestJobs = async (req, res) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const jobs = await Job.find({
      postedAt: { $gte: last24Hours }
    })
      .select("title company location url source postedAt")
      .sort({ postedAt: -1 })
      .limit(50); // prevent overload

    res.json(jobs);

  } catch (error) {
    console.error("Latest Jobs Error:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};
