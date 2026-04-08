const safeDate = (date) => {
  const parsed = new Date(date);
  return isNaN(parsed) ? new Date() : parsed;
};

const normalizeJob = (job, source) => {
  if (!job || !source) return null;

  let normalized = null;

  switch (source) {
    case "RemoteOK":
      normalized = {
        title: job.position || "No Title",
        company: job.company || "Unknown Company",
        location: job.location || "Remote",
        url: job.url || "",
        source: "RemoteOK",
        postedAt: safeDate(job.date)
      };
      break;

    case "Remotive":
      normalized = {
        title: job.title || "No Title",
        company: job.company_name || "Unknown Company",
        location: job.candidate_required_location || "Remote",
        url: job.url || "",
        source: "Remotive",
        postedAt: safeDate(job.publication_date)
      };
      break;

    case "Arbeitnow":
      normalized = {
        title: job.title || "No Title",
        company: job.company_name || "Unknown Company",
        location: job.location || "Remote",
        url: job.url || "",
        source: "Arbeitnow",
        postedAt: job.created_at
          ? safeDate(job.created_at)
          : new Date()
      };
      break;

    default:
      console.warn(`Unknown source: ${source}`);
      return null;
  }

  return normalized;
};

export default normalizeJob;