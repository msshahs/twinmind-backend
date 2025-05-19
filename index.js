
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const meetingRoutes = require("./routes/meeting");
const transcriptRoutes = require("./routes/transcript");
const summaryRoutes = require("./routes/summary.js");


const app = express();
app.use(cors());
app.use(express.json());


// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api", authRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/transcript", transcriptRoutes);
app.use("/api/summary", summaryRoutes);


// Default Route
app.get("/", (req, res) => {
    res.json({ message: "TwinMind Backend Running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});