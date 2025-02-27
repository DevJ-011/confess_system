const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const confessionRoutes = require("./routes/Confessionroutes");

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors()); // Use CORS globally

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

app.use("/auth", authRoutes);
app.use("/confessions", confessionRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
