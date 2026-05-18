# LuaGate 実践開発プロジェクト② — タスク管理アプリ

LuaGate の実践開発プロジェクト第 2 弾。フルスタックの **タスク管理アプリ (個人向け Todo)** を、API と Frontend を 1 つの mono-repo で配布する完成版です。

学習パス Ch180 (Node.js REST API) と Ch200 (React フロント) の集大成として位置付けています。

## 概要

- ユーザーごとのタスク CRUD
- ステータス (`not_started` / `in_progress` / `completed`)、優先度 (`low` / `medium` / `high`)、期限日
- JWT 認証 (signup / login)
- 楽観ロック (version) による同時編集の衝突検知
- Figma 仕様に沿った UI (詳細は `docs/FIGMA.md`)

## 技術スタック

| Layer | Stack |
|-------|-------|
| Backend | Node.js 22 / TypeScript 5.6 / Express 4.21 / Prisma 6 / PostgreSQL |
| Auth | JWT (bcrypt + jsonwebtoken) / zod バリデーション |
| Frontend | Vite + React 18 + TypeScript / TailwindCSS / React Router |
| Infra | Docker (Cloud Run 想定) |

## ディレクトリ構成

```
luagate_pj_task_app/
├─ api/             # バックエンド (Express + Prisma)
│  ├─ src/
│  ├─ prisma/
│  ├─ Dockerfile
│  └─ package.json
├─ frontend/        # フロントエンド (Vite + React)
│  ├─ src/
│  ├─ Dockerfile
│  └─ package.json
└─ docs/
   ├─ API.md           # API 仕様
   ├─ ARCHITECTURE.md  # 全体アーキ図
   └─ FIGMA.md         # Figma URL と node-id 一覧
```

## 必要な環境

- Node.js 22 以上
- Docker (PostgreSQL を立てる用)
- npm 10 以上

## セットアップ手順

### 1. PostgreSQL を起動

```bash
docker run --name luagate-taskapp-pg \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=luagate_taskapp \
  -p 5432:5432 \
  -d postgres:16
```

### 2. API をセットアップ

```bash
cd api
npm install
cp .env.example .env
# DATABASE_URL を環境に合わせて編集

npx prisma migrate dev
npm run db:seed   # デモアカウントとサンプルタスクを投入

npm run dev       # → http://localhost:3030
```

### 3. Frontend をセットアップ

```bash
cd frontend
npm install
cp .env.example .env

npm run dev       # → http://localhost:5174
```

開発時は Vite の dev proxy が `/api/*` を `http://localhost:3030` に転送します。CORS の設定は不要です。

## デモアカウント

`api/prisma/seed.ts` で投入される 3 アカウントでログインできます。

| Email | Password |
|-------|----------|
| alice@example.com | password123 |
| bob@example.com | password123 |
| carol@example.com | password123 |

## デモ URL

- API (Cloud Run) — **準備中** (デプロイ後に更新)
- Frontend (Cloud Run) — **準備中** (デプロイ後に更新)

## Figma

UI 仕様は Figma で管理しています。各画面の node-id は `docs/FIGMA.md` を参照してください。

[Figma — LuaGate 実践開発プロジェクト② タスク管理アプリ](https://www.figma.com/design/5LLAPdI03tsb3z0ufTofP6/)

## ブランチ構成

- `main` — 完成版 (API + Frontend どちらも完成)
- `starter` — 受講生向けのスタータ。`api/` の routes が TODO になっており、自分で実装する課題用

## ライセンス

教材用。

## 関連リポジトリ

- [Luagate-com/luagate_pj_ec_site](https://github.com/Luagate-com/luagate_pj_ec_site) — 実践開発プロジェクト① (Java EC サイト)
- [Luagate-com/luagate_node_mock_api](https://github.com/Luagate-com/luagate_node_mock_api) — Ch180 教材用モック API
