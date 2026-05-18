# API 仕様書

LuaGate 実践開発プロジェクト② のタスク管理アプリ API です。

## 認証フロー

```
POST /api/auth/signup
       ↓ 201 + { user, token }
保存: localStorage.setItem("token", token)

各リクエスト時
       Authorization: Bearer <token>
```

JWT は 7 日で失効します。失効後は再ログインしてください。

## エンドポイント詳細

### POST /api/auth/signup

```json
Request
{
  "email": "me@example.com",
  "password": "password123",
  "displayName": "私の名前"
}

Response 201
{
  "user": { "id": "...", "email": "...", "displayName": "..." },
  "token": "eyJhbGc..."
}
```

エラー応答は次の通りです。
- 400 — バリデーションエラー
- 409 — メールアドレス既登録

### POST /api/auth/login

```json
Request
{ "email": "me@example.com", "password": "password123" }

Response 200
{ "user": {...}, "token": "..." }
```

エラー応答は次の通りです。
- 401 — 認証失敗

### GET /api/me

自分の情報を返します。

```json
Response 200
{
  "id": "...",
  "email": "...",
  "displayName": "...",
  "createdAt": "2026-05-18T00:00:00.000Z"
}
```

### GET /api/tasks

自分のタスク一覧を返します。`?status=` でフィルタできます。

```
GET /api/tasks
GET /api/tasks?status=in_progress
GET /api/tasks?status=not_started
GET /api/tasks?status=completed
```

```json
Response 200
[
  {
    "id": "...",
    "userId": "...",
    "title": "ECサイトのリニューアル設計",
    "description": "...",
    "status": "in_progress",
    "priority": "high",
    "dueDate": "2026-01-31T23:59:59.000Z",
    "version": 1,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### GET /api/tasks/:id

タスク詳細を返します。

```json
Response 200
{
  "id": "...",
  "userId": "...",
  "title": "...",
  "status": "in_progress",
  "priority": "high",
  "dueDate": "...",
  "version": 1,
  ...
}
```

エラー応答は次の通りです。
- 403 — 他人のタスクへのアクセス
- 404 — 存在しない

### POST /api/tasks

```json
Request
{
  "title": "APIのレート制限実装",
  "description": "1 IP あたり 100 req/min",
  "status": "not_started",
  "priority": "high",
  "dueDate": "2026-06-01T00:00:00.000Z"
}

Response 201
{
  "id": "...",
  "userId": "...",
  "title": "APIのレート制限実装",
  "status": "not_started",
  "priority": "high",
  "version": 1,
  ...
}
```

省略可能なフィールドの初期値は次の通りです。
- `status` は `"not_started"`
- `priority` は `"medium"`
- `dueDate` は `null`
- `description` は `null`

### PATCH /api/tasks/:id (楽観ロック)

```json
Request
{
  "title": "新しいタイトル",
  "status": "in_progress",
  "version": 1
}

Response 200 — 更新後の task (version は +1)
Response 409 — 衝突
{
  "error": "Version conflict",
  "currentVersion": 2,
  "yourVersion": 1,
  "currentTask": { ... }
}
```

`version` は必須です。クライアントは取得した最新の version を必ず送ってください。

### DELETE /api/tasks/:id

```
Response 204 No Content
```

## レート制限・サイズ制限

- リクエストボディ — 1MB まで
- パスワード — 8 文字以上
- タイトル — 200 文字まで
- 説明 — 5000 文字まで

## エラーフォーマット

```json
400 Bad Request
{ "error": { "fieldErrors": { "email": ["Invalid email"] } } }

401 Unauthorized
{ "error": "Authorization header required" }

403 Forbidden
{ "error": "Access denied" }

404 Not Found
{ "error": "Task not found" }

409 Conflict
{ "error": "Version conflict", "currentVersion": 2, "yourVersion": 1 }
```

## 学習ポイント

このプロジェクトで体験する重要概念は次の通りです。

1. **JWT 認証** — トークンベース認証、bcrypt でパスワードハッシュ
2. **zod バリデーション** — リクエスト入力の型安全な検証
3. **Prisma の基本** — User と Task の 1:N リレーション
4. **楽観ロック** — version カラムで同時編集の衝突検知
5. **アクセス制御** — タスクの所有者チェック
6. **REST 設計** — リソース指向の URL 命名
