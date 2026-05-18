# luagate_pj_taskapp (starter)

LuaGate 実践開発プロジェクト② — タスク管理アプリの **starter (受講生の出発点)**

このブランチは「ルーティング・バリデーション・型・middleware が用意済の状態」から実装を始められるようにしたものです。各 route の中身は TODO コメントだけが書かれており、`res.status(501)` を返す状態になっています。

完成版は `main` ブランチを参照してください。実装のヒントは [`docs/IMPLEMENTATION_GUIDE.md`](./docs/IMPLEMENTATION_GUIDE.md) を見てください。

## 技術スタック

- Node.js 22 / TypeScript 5.6
- Express 4.21
- Prisma 6 + PostgreSQL
- 認証 JWT (bcrypt + jsonwebtoken)
- バリデーション zod
- セキュリティ helmet + cors

## データモデル

シンプルなフラット構造です。ユーザーがタスクを直接所有します。

- `User` — ユーザー (認証)
- `Task` — タスク本体。`status` ("not_started" / "in_progress" / "completed")、`priority` ("low" / "medium" / "high")、`dueDate`、`version` (楽観ロック)

## ローカル起動

```bash
# 1. 依存インストール
npm install

# 2. .env を作成
cp .env.example .env
# DATABASE_URL を自分の PostgreSQL 接続先に書き換える

# 3. DB migration + seed
npx prisma migrate dev
npm run db:seed

# 4. 起動
npm run dev
# → http://localhost:3030
```

## API エンドポイント

### 認証 (公開)

| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/auth/signup` | アカウント作成 |
| POST | `/api/auth/login` | ログイン → JWT 返却 |

リクエスト例

```bash
curl -X POST http://localhost:3030/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"password123","displayName":"私"}'
```

### 認証付き (Authorization: Bearer TOKEN)

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/me` | 自分の情報 |
| GET | `/api/tasks` | 自分のタスク一覧 (`?status=...` でフィルタ可) |
| GET | `/api/tasks/:id` | タスク詳細 |
| POST | `/api/tasks` | タスク作成 |
| PATCH | `/api/tasks/:id` | タスク編集 (**楽観ロック**) |
| DELETE | `/api/tasks/:id` | タスク削除 |

## 楽観ロック

`PATCH /api/tasks/:id` は version カラムを使った楽観ロックで同時編集の衝突を検知します。

```bash
# version 1 で更新 (成功)
curl -X PATCH http://localhost:3030/api/tasks/abc123 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"新しいタイトル","version":1}'
# → 200 OK + version: 2

# 同じ version 1 で再度更新 (衝突)
curl -X PATCH http://localhost:3030/api/tasks/abc123 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"別のタイトル","version":1}'
# → 409 Conflict
# → { error: "Version conflict", currentVersion: 2, yourVersion: 1, currentTask: {...} }
```

## TODO 一覧 (starter 用チェックリスト)

- [ ] POST `/api/auth/signup`
- [ ] POST `/api/auth/login`
- [ ] GET `/api/me`
- [ ] GET `/api/tasks`
- [ ] GET `/api/tasks/:id`
- [ ] POST `/api/tasks`
- [ ] PATCH `/api/tasks/:id` ★ 楽観ロック ★
- [ ] DELETE `/api/tasks/:id`

## デプロイ (Cloud Run)

```bash
# Docker ビルド + push (Artifact Registry 想定)
docker build -t asia-northeast1-docker.pkg.dev/PROJECT/luagate/taskapp:latest .
docker push asia-northeast1-docker.pkg.dev/PROJECT/luagate/taskapp:latest

# Cloud Run へデプロイ
gcloud run deploy prod-luagate-pj-taskapp-demo \
  --image asia-northeast1-docker.pkg.dev/PROJECT/luagate/taskapp:latest \
  --region asia-northeast1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=...,JWT_SECRET=...
```

## DB スキーマ

`prisma/schema.prisma` を参照。2 モデル構成です。

- `User` — ユーザー (認証)
- `Task` — タスク本体 (status / priority / dueDate / **version** で楽観ロック)

## ライセンス

教材用。

## 関連

- LuaGate 学習パス Ch180 — Node.js REST API
- LuaGate 実践開発プロジェクト#1 — Java EC サイト (`Luagate-com/luagate_pj_ec_site`)
- 完成版 — このリポジトリの `main` ブランチ
