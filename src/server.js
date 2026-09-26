import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import issuesRouter from "./routes/issues.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "issues.db");
if (!fs.existsSync(dbPath)) {
  console.error("Run npm run init-db first.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3881;

app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true, service: "issues-api" }));
app.use("/api/issues", issuesRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Issues API on http://localhost:${PORT}`);
});
