import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index";
import { requireAuth } from "../middleware/auth";

export const tasksRouter = Router();

// --- 入力スキーマ (そのまま使ってよい) ---

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
  // 楽観ロック クライアントが知っている version を必須で渡す
  version: z.number().int().min(1),
});

const listQuerySchema = z.object({
  status: statusEnum.optional(),
});

// --- ルート ---

/**
 * GET /api/tasks
 *
 * TODO 自分のタスク一覧を返す (?status= でフィルタ可能)
 *
 * ヒント
 *   1. listQuerySchema.safeParse(req.query) でバリデーション
 *   2. prisma.task.findMany({ where: { userId: req.userId!, status?: ... } })
 *   3. orderBy で createdAt desc にする
 *
 * 学習ポイント
 *   - クエリパラメータの型もスキーマで検証する
 *   - スプレッド構文で条件を「あれば付ける」パターン
 */
tasksRouter.get("/", requireAuth, async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId: req.userId!,
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(tasks);
});

/**
 * GET /api/tasks/:id
 *
 * TODO タスク詳細を返す (本人のタスクのみ)
 *
 * ヒント
 *   1. prisma.task.findFirst({ where: { id: req.params.id, userId: req.userId! } })
 *      ==WHERE 句に userId を入れる== ことで「他人のタスク」と「存在しないタスク」を
 *      同じ「null」として扱える
 *   2. 結果が null なら 404 を返す
 *   3. 見つかればその task を返す
 *
 * 学習ポイント
 *   - 他人のタスクは ==403 ではなく 404== で隠す (存在自体を漏らさないため)
 *   - 所有チェックは「取得してから比較」ではなく「クエリの WHERE 句」で行うのが鉄則
 *   - 同じパターンを PATCH / DELETE でも繰り返し使う
 */
tasksRouter.get("/:id", requireAuth, async (req, res) => {
  const task = await prisma.task.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!task) {
    return res.status(404).json({ error: "not_found" });
  }
  res.json(task);
});

/**
 * POST /api/tasks
 *
 * TODO タスクを作成
 *
 * ヒント
 *   1. createSchema.safeParse(req.body) でバリデーション
 *   2. prisma.task.create で保存
 *      - userId は req.userId!
 *      - dueDate が来ていれば new Date(dueDate) に変換
 *      - status / priority のデフォルトは "not_started" / "medium"
 *   3. 201 で作成したタスクを返す
 *
 * 学習ポイント
 *   - クライアントから来た文字列の日付は Date に変換してから保存
 *   - undefined と null の違い (undefined = 触らない / null = 明示的に空にする)
 */
tasksRouter.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

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

/**
 * PATCH /api/tasks/:id  ★★ 楽観ロック ★★
 *
 * TODO タスク更新 (所有チェック + 同時編集の衝突を 409 で検知)
 *
 * ヒント
 *   1. updateSchema.safeParse(req.body) でバリデーション (version は必須)
 *   2. prisma.task.updateMany({
 *        where: { id: req.params.id, userId: req.userId!, version: parsed.data.version },
 *        data: { ...更新内容..., version: { increment: 1 } }
 *      })
 *      ==WHERE に userId と version の両方==を入れて 1 発で「所有チェック + 楽観ロック」をやる
 *   3. result.count === 0 のとき、原因を切り分ける
 *      - prisma.task.findFirst({ where: { id, userId } }) で存在確認
 *      - 無ければ 404 (他人のタスク or 存在しない)
 *      - 有れば version 不一致なので 409
 *        { error: "Version conflict", currentVersion, yourVersion, currentTask }
 *   4. 成功したら更新後のタスクを取得して 200 で返す
 *
 * 学習ポイント (この章のキモ)
 *   - 楽観ロック = DB の version カラムで「他人が更新したか」を後追い検知する仕組み
 *   - updateMany を ==1 本の UPDATE== にすれば、所有チェックと version 判定が原子的になる
 *   - 衝突 (409) を受けた UI 側は「相手の編集内容を表示するか、自分の変更を再適用するか」
 *     をユーザーに選ばせる
 *   - 悲観ロックとの違い (悲観 = ロックを先取り / 楽観 = 後で気づく)
 */
tasksRouter.patch("/:id", requireAuth, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  // version はクライアントが「読んだ時点の version」。data には混ぜず WHERE に使う。
  const { version, dueDate, ...rest } = parsed.data;

  const result = await prisma.task.updateMany({
    where: {
      id: req.params.id,
      userId: req.userId!,
      version,
    },
    data: {
      ...rest,
      dueDate:
        dueDate === undefined ? undefined : dueDate === null ? null : new Date(dueDate),
      version: { increment: 1 },
    },
  });

  if (result.count === 0) {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!existing) {
      return res.status(404).json({ error: "not_found" });
    }
    return res.status(409).json({
      error: "Version conflict",
      currentVersion: existing.version,
      yourVersion: version,
      currentTask: existing,
    });
  }

  const updated = await prisma.task.findUnique({ where: { id: req.params.id } });
  res.json(updated);
});

/**
 * DELETE /api/tasks/:id
 *
 * TODO タスクを削除 (所有者のみ)
 *
 * ヒント
 *   1. prisma.task.deleteMany({ where: { id: req.params.id, userId: req.userId! } })
 *      ==WHERE に userId を含める== ことで「他人のタスク」と「存在しないタスク」を
 *      まとめて「count===0」として扱える
 *   2. result.count === 0 なら 404 を返す (他人のタスクも 404 で隠す)
 *   3. 成功時は 204 No Content
 *
 * 学習ポイント
 *   - DELETE は通常レスポンスボディを返さない (204)
 *   - 認可チェックを ==クエリの WHERE 句== でやる (削除こそ事故が起きやすい)
 *   - 他人のタスクは 403 ではなく 404 で隠す (存在を漏らさない)
 */
tasksRouter.delete("/:id", requireAuth, async (req, res) => {
  const result = await prisma.task.deleteMany({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (result.count === 0) {
    return res.status(404).json({ error: "not_found" });
  }
  res.status(204).send();
});
