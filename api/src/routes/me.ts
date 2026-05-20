import { Router } from "express";
import { prisma } from "../index";
import { requireAuth } from "../middleware/auth";

export const meRouter = Router();

/**
 * GET /api/me
 *
 * TODO 認証済みユーザーの情報を返す
 *
 * ヒント
 *   1. requireAuth ミドルウェアが既に付いているので、ここに来た時点で req.userId が入っている
 *   2. prisma.user.findUnique({ where: { id: req.userId! } }) で取得
 *   3. passwordHash はレスポンスに含めない (select で必要なフィールドだけ取る)
 *   4. ユーザーが居なければ 404
 *
 * 学習ポイント
 *   - middleware で「認証済みかどうか」と「リクエスト処理」を分離するパターン
 *   - findUnique の select でレスポンスから機密フィールドを除外する習慣
 */
meRouter.get("/", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, email: true, displayName: true, createdAt: true },
  });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json(user);
});
