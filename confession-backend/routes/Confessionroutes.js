const express = require("express");
const router = express.Router();
const Confession = require("../models/Confession");
const jwt = require("jsonwebtoken");

// Middleware to verify the token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log('Authorization Header:', req.header("Authorization"));
  
  if (!token) {
    return res.status(403).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure .env contains JWT_SECRET
    req.user = decoded; // Attach the decoded user info to the request
    next();
  } catch (error) {
    console.error('JWT Error:', error);
    res.status(403).json({ message: "Invalid token" });
  }
};

// Create a new confession
router.post("/", verifyToken, async (req, res) => {
  try {
    const { message, isPrivate } = req.body;

    const confession = new Confession({
      message,
      isPrivate,
      userId: req.user.id || req.user._id, // Ensure correct user ID
    });

    await confession.save();
    res.status(201).json({ message: "Confession added successfully!", confession });
  } catch (error) {
    console.error("Confession Creation Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all confessions (public for guests, personalized for logged-in users)
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
        }).sort({ createdAt: -1 });

        return res.json(confessions);
      } catch (err) {
        console.error("JWT Verification Error:", err);
        return res.status(403).json({ message: "Invalid token" });
      }
    }

    // No token → Show only public confessions
    confessions = await Confession.find({ isPrivate: false }).sort({ createdAt: -1 });
    return res.json(confessions);
  } catch (error) {
    console.error("Fetch Confessions Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
