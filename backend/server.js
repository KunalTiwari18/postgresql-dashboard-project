import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json());

// ✅ PostgreSQL Connection (Render SSL Fix)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false, // Fix for Render's SSL certs
  },
});

// ✅ Test route
app.get("/", (req, res) => {
  res.json({ message: "✅ Backend is running on Render!" });
});

// ✅ Run-query route
app.post("/run-query", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "No query provided" });
  }

  try {
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Query Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
