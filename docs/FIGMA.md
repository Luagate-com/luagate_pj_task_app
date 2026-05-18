# Figma 仕様

LuaGate 実践開発プロジェクト② タスク管理アプリの UI 仕様は、すべて下記の Figma で管理しています。

**Figma URL** [LuaGate 実践開発プロジェクト② タスク管理アプリ](https://www.figma.com/design/5LLAPdI03tsb3z0ufTofP6/)

## 画面 / node-id 一覧

| 画面 | Figma node-id | 説明 |
|------|--------------|------|
| ログイン | `948-1147` | メール + パスワードでログイン |
| 新規登録 | `948-1227` | アカウント作成 (表示名 / メール / パスワード) |
| タスク一覧 | `948-1352` | 自分のタスクをカード形式で一覧。ステータス別タブ + 検索 + 並び替え |
| タスク作成モーダル | `948-1749` | タイトル / 説明 / 優先度 / 期限日を入力して作成 |
| タスク詳細モーダル | `948-1830` | 1 件のタスクの全情報を表示 |
| タスク編集モーダル | `953-2250` | 詳細モーダルから「編集」で開く。楽観ロック対応 |
| タスク削除確認ダイアログ | `948-2134` | 削除前に確認 |

## node-id を Figma URL に渡す方法

Figma の URL の末尾に `?node-id=<id>` を付けると、その node を中心に開けます。

例
- ログイン画面 — `https://www.figma.com/design/5LLAPdI03tsb3z0ufTofP6/?node-id=948-1147`
- タスク一覧 — `https://www.figma.com/design/5LLAPdI03tsb3z0ufTofP6/?node-id=948-1352`

## デザイントークン

主要なカラー / フォントは Figma の Variables を参照してください。Tailwind 側でも以下を定義しています (`frontend/tailwind.config.js`)。

- Primary `#0071E3` (LuaGate ブランドカラー)
- Success `#22C55E`
- Warning `#F59E0B`
- Danger `#EF4444`
- Border `#E5E7EB`
- Text Main `#111827`
- Text Sub `#6B7280`

## アセット (画像 / アイコン)

ローカル開発で Figma 由来の画像アセットを使う場合は `frontend/public/figma-assets/` 配下に配置してください。このディレクトリは `.gitignore` でコミット対象から除外しています。

アイコンは原則として [Lucide React](https://lucide.dev/) を使い、Figma から PNG/SVG を切り出さなくて済むようにしています。
