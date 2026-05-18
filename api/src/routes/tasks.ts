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
  res.status(501).json({ error: "Not implemented yet — finish this!" });
});

/**
 * GET /api/tasks/:id
 *
 * TODO タスク詳細を返す (本人のタスクのみ)
 *
 * ヒント
 *   1. prisma.task.findUnique({ where: { id: req.params.id } })
 *   2. 見つからなければ 404
 *   3. task.userId !== req.userId! なら 403 (他人のタスクを覗かせない)
 *   4. それ以外なら task を返す
 *
 * 学習ポイント
 *   - 「無い」 (404) と「権限なし」 (403) は分けて返す
 *   - 認可 (この人にアクセス権がある?) はルートごとに必ず書く
 */
tasksRouter.get("/:id", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented yet — finish this!" });
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
  res.status(501).json({ error: "Not implemented yet — finish this!" });
});

/**
 * PATCH /api/tasks/:id  ★★ 楽観ロック ★★
 *
 * TODO タスク更新 (同時編集の衝突を 409 で検知)
 *
 * ヒント
 *   1. updateSchema.safeParse(req.body) でバリデーション (version は必須)
 *   2. prisma.task.findUnique で取得 → 404 / 403 をチェック
 *   3. task.version !== body.version なら 409 を返す
 *      { error: "Version conflict", currentVersion: task.version, yourVersion, currentTask }
 *   4. 一致したら prisma.task.update で更新。data に version: { increment: 1 } を含める
 *   5. 更新後の task を 200 で返す
 *
 * 学習ポイント (この章のキモ)
 *   - 楽観ロック = DB の version カラムで「他人が更新したか」を後追い検知する仕組み
 *   - 衝突 (409) を受けた UI 側は「相手の編集内容を表示するか、自分の変更を再適用するか」
 *     をユーザーに選ばせる
 *   - 悲観ロックとの違い (悲観 = ロックを先取り / 楽観 = 後で気づく)
 */
tasksRouter.patch("/:id", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented yet — finish this!" });
});

/**
 * DELETE /api/tasks/:id
 *
 * TODO タスクを削除
 *
 * ヒント
 *   1. prisma.task.findUnique で取得 → 404 / 403 をチェック
 *   2. prisma.task.delete({ where: { id } })
 *   3. 204 No Content で返す
 *
 * 学習ポイント
 *   - DELETE は通常レスポンスボディを返さない (204)
 *   - 認可チェックを忘れずに (削除こそ事故が起きやすい)
 */
tasksRouter.delete("/:id", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented yet — finish this!" });
});
