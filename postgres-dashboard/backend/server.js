import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "12345", // your password
  port: 5432,
});

// Test connection
pool
  .connect()
  .then(() => console.log("✅ Express + PostgreSQL Backend Connected Successfully!"))
  .catch((err) => console.error("❌ Database connection error:", err));

// Default route
app.get("/", (req, res) => {
  res.send("✅ PostgreSQL Dashboard Backend Running!");
});

// 🔹 Route to handle SQL query execution
app.post("/run-query", async (req, res) => {
  const { query } = req.body;

  try {
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Query Error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
