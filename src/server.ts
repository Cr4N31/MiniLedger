import "dotenv/config";
import express from "express";
import { pool } from "./config/database";
import loansRouter from "./routes/loans";
import authRouter from "./routes/auth";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use("/api/loans", loansRouter);
app.use("/api/auth", authRouter);
// Test route
app.get("/", (_req, res) => {
  res.json({ message: "MiniLedger API is running!" });
});

// Test database connection
app.get("/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");

    res.json({
      status: "healthy",
      database: "connected",
      time: result.rows[0].time,
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
    });
  }
});

app.listen(PORT, () => {
  console.log(`MiniLedger API running on http://localhost:${PORT}`);
});
