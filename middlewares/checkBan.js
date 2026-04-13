import User from "../models/user.js";

export const checkBan = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId).select("banned");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.banned) {
      return res.status(403).json({ error: "You are banned" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};