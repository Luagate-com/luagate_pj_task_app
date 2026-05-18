import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index";
import { requireAuth } from "../middleware/auth";

export const tasksRouter = Router();

// --- 入力スキーマ ---

const statusEnum = z.enum(["not_started", "in_progress", "completed"]);
const priorityEnum = z.enum(["low", "medium", "high"]);

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, "YYYY-MM-DD or ISO 8601 datetime")
    .nullable()
    .optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, "YYYY-MM-DD or ISO 8601 datetime")
    .nullable()
    .optional(),
  // 楽観ロック: クライアントが知っている version を渡す
  version: z.number().int().min(1),
});

const listQuerySchema = z.object({
  status: statusEnum.optional(),
});

// --- ルート ---

// 自分のタスク一覧 (?status= でフィルタ可)
tasksRouter.get("/", requireAuth, async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const tasks = await prisma.task.findMany({
    where: {
      userId: req.userId!,
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(tasks);
});

// タスク詳細
tasksRouter.get("/:id", requireAuth, async (req, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) return res.status(404).json({ error: "Task not found" });
  if (task.userId !== req.userId!) {
    return res.status(403).json({ error: "Access denied" });
  }
  res.json(task);
});

// タスク作成
tasksRouter.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const task = await prisma.task.create({
    data: {
      userId: req.userId!,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status ?? "not_started",
      priority: parsed.data.priority ?? "medium",
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  });
  res.status(201).json(task);
});

// 更新 (楽観ロック付き) — 同時編集の衝突を 409 で返す
tasksRouter.patch("/:id", requireAuth, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) return res.status(404).json({ error: "Task not found" });
  if (task.userId !== req.userId!) {
    return res.status(403).json({ error: "Access denied" });
  }

  // 楽観ロック判定 — クライアントが見ていた version と DB が一致しなければ衝突
  if (task.version !== parsed.data.version) {
    return res.status(409).json({
      error: "Version conflict",
      currentVersion: task.version,
      yourVersion: parsed.data.version,
      currentTask: task,
    });
  }

  const updated = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate:
        parsed.data.dueDate === undefined
          ? undefined
          : parsed.data.dueDate === null
          ? null
          : new Date(parsed.data.dueDate),
      version: { increment: 1 },
    },
  });
  res.json(updated);
});

// タスク削除
tasksRouter.delete("/:id", requireAuth, async (req, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) return res.status(404).json({ error: "Task not found" });
  if (task.userId !== req.userId!) {
    return res.status(403).json({ error: "Access denied" });
  }

  await prisma.task.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
