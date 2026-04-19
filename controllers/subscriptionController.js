import User from "../models/user.js";

// 🔄 Upgrade Plan
export const upgradePlan = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const { plan } = req.body;

    const allowedPlans = ["free", "standard", "team"];
    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If same plan, avoid unnecessary DB write
    if (user.subscription === plan) {
      return res.status(200).json({
        message: "You are already on this plan",
        subscription: user.subscription,
        expiry: user.subscriptionExpiry,
      });
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    user.subscription = plan;
    user.subscriptionExpiry = expiry;

    await user.save();

    return res.status(200).json({
      message: `Successfully upgraded to ${plan}`,
      subscription: user.subscription,
      expiry: user.subscriptionExpiry,
    });

  } catch (err) {
    console.error("Upgrade Plan Error:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};