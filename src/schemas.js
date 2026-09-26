import { z } from "zod";

export const statuses = ["open", "in_progress", "done", "cancelled"];
export const priorities = ["low", "medium", "high", "critical"];

export const createIssueSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(10000).optional().default(""),
  status: z.enum(statuses).optional().default("open"),
  priority: z.enum(priorities).optional().default("medium"),
  labels: z.array(z.string().min(1).max(40)).max(20).optional().default([]),
  assignee: z.string().max(80).nullable().optional().default(null),
});

export const updateIssueSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    body: z.string().max(10000).optional(),
    status: z.enum(statuses).optional(),
    priority: z.enum(priorities).optional(),
    labels: z.array(z.string().min(1).max(40)).max(20).optional(),
    assignee: z.string().max(80).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "At least one field required" });

export function parseLabels(raw) {
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function rowToIssue(row) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    status: row.status,
    priority: row.priority,
    labels: parseLabels(row.labels),
    assignee: row.assignee,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
