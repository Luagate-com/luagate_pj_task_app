# LuaGate 実践開発プロジェクト② — Kanban フロントエンド

Vite + React + TypeScript で構築された Kanban タスク管理アプリのフロントエンド。バックエンド API (`luagate_pj_taskapp`) と連携して動く。

## セットアップ

```bash
# Node v22 を使う
export PATH="$HOME/.nvm/versions/node/v22.20.0/bin:$PATH"

npm install
cp .env.example .env
```

### API への接続方法

- **開発時 (`npm run dev`)**: `VITE_API_BASE_URL` を**未設定**にしておく。Vite の dev proxy が `/api/*` を `http://localhost:3030` に転送するので CORS の心配がない。プロキシ先を変えたい場合は `VITE_DEV_API_PROXY_TARGET` を設定する。
- **本番ビルド**: `VITE_API_BASE_URL` にバックエンドのフル URL（例: `https://api.example.com`）を入れて `npm run build` する。

## 起動

```bash
# 1) バックエンド (別ターミナル) を起動済みであること
#    cd ../luagate_pj_taskapp && npm run dev

# 2) フロントエンドを起動
npm run dev
# → http://localhost:5174
```

デモアカウントでログインできる。

- alice@example.com / password123
- bob@example.com / password123
- carol@example.com / password123

## 主な機能

- JWT 認証（ログイン / サインアップ）
- 自分が所有 or 参加しているボード一覧
- Kanban ボード（列 + タスクカード）
- @dnd-kit でドラッグ&ドロップ（列内並べ替え + 列をまたぐ移動）
- タスク詳細モーダル（楽観ロックによる衝突検知 UI 付き）
- コメント投稿
- メンバー招待（オーナーのみ）

## ビルド & 型チェック

```bash
npm run typecheck
npm run build
```

## デプロイ (Cloud Run / Docker)

```bash
docker build -t luagate-taskapp-frontend .
docker run -p 8080:80 luagate-taskapp-frontend
```
