import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    company: {
      type: String,
      required: true,
      trim: true,
      default: "Unknown"
    },

    location: {
      type: String,
      trim: true,
      default: "Remote"
    },

    salary: {
      type: String,
      trim: true,
      default: ""
    },

    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      default: "Full-time",
      index: true // 🔥 faster filtering
    },

    source: {
      type: String,
      required: true,
      enum: ["RemoteOK", "Remotive", "Arbeitnow"]
    },

    url: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    postedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);


// Indexes for performance
jobSchema.index({ postedAt: -1 }); // fast sorting
jobSchema.index({ title: "text", location: "text" }); // search optimization


export default mongoose.model("Job", jobSchema);