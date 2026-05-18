import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../index";
import { signToken } from "../middleware/auth";

export const authRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(50),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

/**
 * POST /api/auth/signup
 *
 * TODO アカウント作成 + JWT 発行
 *
 * ヒント
 *   1. signupSchema.safeParse(req.body) でバリデーション。失敗時は 400
 *   2. 同じ email が既に登録されていないか prisma.user.findUnique で確認 (重複なら 409)
 *   3. bcrypt.hash(password, 10) でパスワードをハッシュ化
 *   4. prisma.user.create で保存 (passwordHash を保存、password 平文は保存しない)
 *   5. signToken(user.id) で JWT を発行
 *   6. 201 で { user, token } を返す (passwordHash はレスポンスに含めない)
 *
 * 学習ポイント
 *   - パスワードは絶対に平文で DB に入れない。必ず一方向ハッシュ
 *   - bcrypt は salt 自動付与 + cost factor で総当たり攻撃に強い
 *   - メール重複は 409 Conflict が定石
 */
authRouter.post("/signup", async (req, res) => {
  res.status(501).json({ error: "Not implemented yet — finish this!" });
});

/**
 * POST /api/auth/login
 *
 * TODO メール + パスワードで認証して JWT を返す
 *
 * ヒント
 *   1. loginSchema.safeParse(req.body) でバリデーション
 *   2. prisma.user.findUnique({ where: { email } }) でユーザー取得
 *   3. ユーザーが居ない or bcrypt.compare が false なら 401
 *      (どちらの理由かをレスポンスで区別しない方がセキュリティ的に良い)
 *   4. signToken(user.id) で JWT を発行
 *   5. 200 で { user, token } を返す
 *
 * 学習ポイント
 *   - JWT のペイロードに userId だけ入れる (機密情報は入れない)
 *   - 「メール無し」と「パスワード違う」を同じ 401 にするとアカウント列挙対策になる
 */
authRouter.post("/login", async (req, res) => {
  res.status(501).json({ error: "Not implemented yet — finish this!" });
});
