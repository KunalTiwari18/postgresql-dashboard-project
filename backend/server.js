import express from "express";
import cors from "cors";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "postgres",
  password: process.env.PGPASSWORD || "your_password_here",
  port: process.env.PGPORT || 5432,
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB Connection Error:", err.message));

// ---------- API ENDPOINTS ----------

// PostgreSQL Query Compiler
app.post("/api/execute", async (req, res) => {
  try {
    const { query } = req.body;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Oracle ➜ PostgreSQL Translator
app.post("/api/translate", (req, res) => {
  const { code } = req.body;
  let translated = code
    .replace(/VARCHAR2/g, "VARCHAR")
    .replace(/NVL/g, "COALESCE")
    .replace(/SYSDATE/g, "CURRENT_TIMESTAMP")
    .replace(/DUAL/g, "")
    .replace(/BEGIN/g, "")
    .replace(/END;/g, "");
  res.json({ translated });
});

// ---------- Serve Frontend ----------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../build");

app.use(express.static(frontendPath));
app.get("*", (_, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
