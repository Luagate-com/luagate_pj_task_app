# 実装ガイド (starter)

LuaGate 実践開発プロジェクト② タスク管理アプリ — **API 実装のヒント**

このドキュメントは `starter` ブランチで API を自力実装する受講生向けです。`main` ブランチには完成版があるので、行き詰まったら覗いてもよいですが「写経」は学習効果が薄いので、まずは自分で考えてみてください。

## 完成版との差分

| ファイル | starter | main |
|---------|---------|------|
| `api/src/index.ts` | 完成済 (触らなくてよい) | 完成済 |
| `api/src/middleware/auth.ts` | 完成済 (`requireAuth`, `signToken`) | 完成済 |
| `api/prisma/schema.prisma` | 完成済 | 完成済 |
| `api/prisma/seed.ts` | 完成済 | 完成済 |
| `api/src/routes/auth.ts` | **TODO** | 完成済 |
| `api/src/routes/me.ts` | **TODO** | 完成済 |
| `api/src/routes/tasks.ts` | **TODO** | 完成済 |
| `frontend/` | 完成版そのまま | 完成版そのまま |

つまり受講生は **API の routes だけ** を実装する課題です。フロントは完成版のまま動くので、API の実装が進むにつれてフロントの動作も復活していきます。

## 実装する順番 (おすすめ)

1. **Ch1 — `auth.ts`** — signup / login。JWT を発行できるようになる
2. **Ch2 — `me.ts`** — `GET /api/me` で「自分の情報」を返す。認証が効いてるか確認
3. **Ch3 — `tasks.ts`**
   - 3-1. GET 一覧 + 詳細
   - 3-2. POST 作成
   - 3-3. PATCH 更新 ★ **楽観ロック** ★
   - 3-4. DELETE 削除

## 各 route のヒント

各 route ファイルの中に TODO コメントと「ヒント」「学習ポイント」を書いてあります。コードの中身を見ながら進めてください。

### Ch1 auth.ts

`bcrypt.hash` でハッシュ化 → 比較は `bcrypt.compare`。JWT の発行は `signToken(user.id)` で OK。

```typescript
// 例 signup の流れ
const parsed = signupSchema.safeParse(req.body);
if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
if (existing) return res.status(409).json({ error: "Email already registered" });

const passwordHash = await bcrypt.hash(parsed.data.password, 10);
const user = await prisma.user.create({
  data: { email: parsed.data.email, passwordHash, displayName: parsed.data.displayName },
  select: { id: true, email: true, displayName: true },
});

const token = signToken(user.id);
res.status(201).json({ user, token });
```

### Ch2 me.ts

ほぼ 1 クエリで完結します。`select` で `passwordHash` を除外するのを忘れずに。

### Ch3 tasks.ts (楽観ロックがキモ)

GET / POST / DELETE は素直な CRUD です。問題は **PATCH の楽観ロック**。

```typescript
// PATCH /api/tasks/:id
const task = await prisma.task.findUnique({ where: { id: req.params.id } });
if (!task) return res.status(404).json({ error: "Task not found" });
if (task.userId !== req.userId!) return res.status(403).json({ error: "Access denied" });

// 楽観ロックのコア — クライアントが見ていた version と DB の値を照合
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
  data: { ...parsed.data, version: { increment: 1 } },
});
res.json(updated);
```

## 動作確認 (curl)

```bash
# Signup
curl -X POST http://localhost:3030/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"password123","displayName":"私"}'
# 期待 201 Created + { user, token }

# Login
curl -X POST http://localhost:3030/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'

TOKEN="ログインで得た JWT"

# 自分の情報
curl http://localhost:3030/api/me -H "Authorization: Bearer $TOKEN"

# タスク一覧
curl http://localhost:3030/api/tasks -H "Authorization: Bearer $TOKEN"

# タスク作成
curl -X POST http://localhost:3030/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"新しいタスク","priority":"high"}'

# 楽観ロックの衝突を試す (同じ version で 2 回 PATCH すれば 2 回目で 409)
curl -X PATCH http://localhost:3030/api/tasks/{TASK_ID} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"更新版","version":1}'
```

## フロント (frontend/) と組み合わせて確認

API を実装したら、別ターミナルで frontend を起動して動かしてみましょう。

```bash
cd frontend
npm install
npm run dev
# http://localhost:5174
```

`alice@example.com / password123` でログインできれば auth が通っています。タスクが表示されない時は `tasks.ts` の GET 一覧、作成できない時は POST、編集できない時は PATCH を疑ってください。

## 詰まった時

1. まず TODO コメントの「ヒント」を読む
2. `docs/API.md` で期待されるリクエスト/レスポンスを確認
3. ブラウザの DevTools (Network タブ) で 401 / 404 / 500 のどれが返っているか見る
4. それでもダメなら `main` ブランチの同じファイルを覗く
