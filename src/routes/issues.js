import { Router } from "express";
import { db } from "../db.js";
import {
  createIssueSchema,
  updateIssueSchema,
  rowToIssue,
} from "../schemas.js";

const router = Router();

router.get("/", (req, res) => {
  const { status, priority, label, q, assignee } = req.query;
  let sql = "SELECT * FROM issues WHERE 1=1";
  const params = [];
  if (status) { sql += " AND status = ?"; params.push(status); }
  if (priority) { sql += " AND priority = ?"; params.push(priority); }
  if (assignee) { sql += " AND assignee = ?"; params.push(assignee); }
  if (label) { sql += " AND labels LIKE ?"; params.push(`%"${label}"%`); }
  if (q) {
    sql += " AND (title LIKE ? OR body LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  sql += " ORDER BY updated_at DESC";
  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(rowToIssue));
});

router.get("/stats", (req, res) => {
  const byStatus = db.prepare("SELECT status, COUNT(*) AS count FROM issues GROUP BY status").all();
  const byPriority = db.prepare("SELECT priority, COUNT(*) AS count FROM issues GROUP BY priority").all();
  res.json({ byStatus, byPriority, total: db.prepare("SELECT COUNT(*) AS c FROM issues").get().c });
});

router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM issues WHERE id = ?").get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(rowToIssue(row));
});

router.post("/", (req, res) => {
  const parsed = createIssueSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { title, body, status, priority, labels, assignee } = parsed.data;
  const info = db
    .prepare(
      "INSERT INTO issues (title, body, status, priority, labels, assignee) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(title, body, status, priority, JSON.stringify(labels), assignee);
  const row = db.prepare("SELECT * FROM issues WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(rowToIssue(row));
});

router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM issues WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Not found" });
  const parsed = updateIssueSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;
  const next = {
    title: data.title ?? existing.title,
    body: data.body ?? existing.body,
    status: data.status ?? existing.status,
    priority: data.priority ?? existing.priority,
    labels: data.labels !== undefined ? JSON.stringify(data.labels) : existing.labels,
    assignee: data.assignee !== undefined ? data.assignee : existing.assignee,
  };
  db.prepare(
    "UPDATE issues SET title=?, body=?, status=?, priority=?, labels=?, assignee=?, updated_at=datetime('now') WHERE id=?"
  ).run(next.title, next.body, next.status, next.priority, next.labels, next.assignee, id);
  res.json(rowToIssue(db.prepare("SELECT * FROM issues WHERE id = ?").get(id)));
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare("DELETE FROM issues WHERE id = ?").run(id);
  if (info.changes === 0) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
});

export default router;
