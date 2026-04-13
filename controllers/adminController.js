// // controllers/adminController.js
// import Job from "../models/job.js";
// import User from "../models/user.js";
// import { fetchAllJobs } from "../services/scraper.js";


// // Get Dashboard Stats
// export const getStats = async (req, res) => {
//   try {
//     const totalJobs = await Job.countDocuments();
//     const totalUsers = await User.countDocuments();

//     const jobsBySource = await Job.aggregate([
//       { $group: { _id: "$source", count: { $sum: 1 } } }
//     ]);

//     res.json({
//       totalJobs,
//       totalUsers,
//       jobsBySource
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // Get All Jobs
// export const getAllJobs = async (req, res) => {
//   try {
//     const jobs = await Job.find().sort({ createdAt: -1 });
//     res.json(jobs);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // Delete Job
// export const deleteJob = async (req, res) => {
//   try {
//     await Job.findByIdAndDelete(req.params.id);
//     res.json({ message: "Job deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // Get All Users
// export const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find().select("-password");
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// //  Ban User
// export const banUser = async (req, res) => {
//   try {
//     await User.findByIdAndUpdate(req.params.id, { banned: true });
//     res.json({ message: "User banned" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // Trigger Job Fetch
// export const fetchJobsManually = async (req, res) => {
//   try {
//     await fetchAllJobs();
//     res.json({ message: "Jobs fetched successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// controllers/adminController.js

import mongoose from "mongoose";
import Job from "../models/job.js";
import User from "../models/user.js";
import { fetchAllJobs } from "../services/scraper.js";

// 🔒 Helper: Validate ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Scraper Lock
let isFetching = false;


/**
 *  Get Dashboard Stats
 */
export const getStats = async (req, res) => {
  try {
    const [totalJobs, totalUsers, jobsBySource, recentJobs] = await Promise.all([
      Job.countDocuments(),
      User.countDocuments(),

      Job.aggregate([
        { $group: { _id: "$source", count: { $sum: 1 } } }
      ]),

      Job.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title company source createdAt")
        .lean()
    ]);

    res.json({
      totalJobs,
      totalUsers,
      jobsBySource,
      recentJobs
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


/**
 *  Get All Jobs (Pagination + Search + Filter)
 */
export const getAllJobs = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", source } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = {};

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } }
      ];
    }

    // Filter
    if (source) {
      query.source = source;
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Job.countDocuments(query)
    ]);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      jobs
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


/**
 *  Delete Job
 */
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({ message: "Job deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


/**
 *  Get All Users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .lean();

    res.json(users);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


/**
 * Ban User
 */
export const banUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.banned) {
      return res.status(400).json({ error: "User already banned" });
    }

    user.banned = true;
    await user.save();

    res.json({ message: "User banned successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


/**
 *  Trigger Job Fetch (Background Safe)
 */
export const fetchJobsManually = async (req, res) => {
  try {
    if (isFetching) {
      return res.status(400).json({ message: "Job fetching already in progress" });
    }

    isFetching = true;

    fetchAllJobs()
      .then(() => console.log("Jobs fetched successfully"))
      .catch(err => console.error("Scraper error:", err))
      .finally(() => {
        isFetching = false;
      });

    res.json({ message: "Job fetching started in background" });

  } catch (err) {
    isFetching = false;
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};