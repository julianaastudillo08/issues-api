import { DatabaseSync } from "node:sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "issues.db");
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'medium',
    labels TEXT NOT NULL DEFAULT '[]',
    assignee TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
  CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
`);

const count = db.prepare("SELECT COUNT(*) AS c FROM issues").get().c;
if (count === 0) {
  const ins = db.prepare(
    "INSERT INTO issues (title, body, status, priority, labels, assignee) VALUES (?, ?, ?, ?, ?, ?)"
  );
  ins.run("Setup CI pipeline", "Add GitHub Actions for lint + test.", "open", "high", JSON.stringify(["infra","ci"]), "juliana");
  ins.run("Polish landing hero", "Tighten copy and motion.", "in_progress", "medium", JSON.stringify(["frontend","ux"]), "juliana");
  ins.run("Document API curl examples", "README with examples.", "done", "low", JSON.stringify(["docs"]), null);
}
console.log("issues.db initialized at", dbPath);
