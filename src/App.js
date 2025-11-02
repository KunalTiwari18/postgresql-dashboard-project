import React, { useState } from "react";
import axios from "axios";

function App() {
  const [oracleQuery, setOracleQuery] = useState("");
  const [translatedQuery, setTranslatedQuery] = useState("");
  const [pgQuery, setPgQuery] = useState("");
  const [queryResult, setQueryResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Oracle ➜ PostgreSQL Translator
  const handleTranslate = () => {
    if (!oracleQuery.trim()) return alert("Please enter a PL/SQL query!");

    let query = oracleQuery;

    // Basic replacements
    query = query.replace(/VARCHAR2/gi, "VARCHAR");
    query = query.replace(/NVL/gi, "COALESCE");
    query = query.replace(/SYSDATE/gi, "NOW()");
    query = query.replace(/DUAL/gi, "");
    query = query.replace(/SELECT\s+(.*)\s+FROM\s*;/gi, "RAISE NOTICE '%', \\1;");
    query = query.replace(/DECLARE/gi, "DO $$ DECLARE");
    query = query.replace(/END;/gi, "END $$;");
    query = query.replace(/:=/g, ":=");

    setTranslatedQuery(query.trim());
  };

  // Run PostgreSQL Query via backend (Render deployment)
  const handleRunQuery = async () => {
    if (!pgQuery.trim()) return alert("Please enter a PostgreSQL query!");
    setLoading(true);
    setQueryResult("");

    try {
      const response = await axios.post(
        "https://postgresql-dashboard.onrender.com/run-query",
        { query: pgQuery }
      );
      setQueryResult(JSON.stringify(response.data, null, 2));
    } catch (err) {
      setQueryResult("❌ Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
        🧩 PostgreSQL Dashboard — Compiler & Translator
      </h1>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* ---------- Oracle ➜ PostgreSQL Translator ---------- */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🔄 Oracle ➜ PostgreSQL Translator
          </h2>

          <p className="text-center text-sm text-green-600 mb-2">
            🟢 Backend Connected — {`https://postgresql-dashboard.onrender.com`}
          </p>

          <textarea
            className="w-full border p-3 rounded-lg h-40 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter your PL/SQL (Oracle) code here..."
            value={oracleQuery}
            onChange={(e) => setOracleQuery(e.target.value)}
          />

          <button
            onClick={handleTranslate}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Translate to PostgreSQL
          </button>

          {translatedQuery && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-700 mb-2">
                🧠 Translated PostgreSQL Query:
              </h3>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {translatedQuery}
              </pre>
            </div>
          )}
        </div>

        {/* ---------- PostgreSQL Query Compiler ---------- */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🧮 PostgreSQL Query Compiler
          </h2>

          <textarea
            className="w-full border p-3 rounded-lg h-40 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Write your PostgreSQL query here..."
            value={pgQuery}
            onChange={(e) => setPgQuery(e.target.value)}
          />

          <button
            onClick={handleRunQuery}
            className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
          >
            {loading ? "Running..." : "Run Query"}
          </button>

          {queryResult && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-700 mb-2">📊 Output:</h3>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {queryResult}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
