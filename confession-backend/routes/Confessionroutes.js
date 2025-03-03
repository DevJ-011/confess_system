const express = require("express");
const router = express.Router();
const Confession = require("../models/Confession");
const jwt = require("jsonwebtoken");

// Middleware to verify the token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    console.log("🔓 Decoded Token:", verified); // Log token data
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};




// Create a new confession
router.post("/", verifyToken, async (req, res) => {
  try {
    const { message, isPrivate } = req.body;
    const confession = new Confession({
      message,
      isPrivate,
      userId: req.user.id || req.user._id,
    });

    await confession.save();
    res.status(201).json({ message: "Confession added successfully!", confession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all confessions (Public & Private for owner)
router.get("/", async (req, res) => {
  try {
    let confessions;
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        confessions = await Confession.find({
          $or: [{ isPrivate: false }, { userId: decoded.id || decoded._id }],
        })
          .sort({ createdAt: -1 })
          .populate("comments"); // Populate comments in response

        return res.json(confessions);
      } catch (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
    }

    // No token → Show only public confessions
    confessions = await Confession.find({ isPrivate: false })
      .sort({ createdAt: -1 })
      .populate("comments");

    return res.json(confessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ Add Comment Route
router.post("/:id/comments", verifyToken, async (req, res) => {


  try {
    const { text } = req.body;
    const confessionId = req.params.id;
    const userId = req.user?.id; // Ensure `req.user` is not undefined

    console.log("🔍 Incoming Comment Request:");
    console.log("📌 Confession ID:", confessionId);
    console.log("📌 User ID:", userId);
    console.log("📌 Comment Text:", text);

    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const confession = await Confession.findById(confessionId);
    if (!confession) {
      console.error("🚨 Confession Not Found:", confessionId);
      return res.status(404).json({ message: "Confession not found" });
    }

    // Add the comment (Make sure your schema has a comments field)
    confession.comments = confession.comments || []; // Ensure comments array exists
confession.comments.push({ text, user: userId });

    await confession.save();

    res.json({ message: "Comment added successfully", confession });
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});





module.exports = router;
