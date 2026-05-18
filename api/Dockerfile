# LuaGate 実践開発プロジェクト② タスク管理アプリ用 Dockerfile
# Cloud Run へのデプロイ想定

FROM node:22-alpine AS builder

WORKDIR /app

# 依存関係インストール
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# ソースコピー + Prisma Client 生成 + TS ビルド
COPY . .
RUN npx prisma generate
RUN npm run build

# 本番用イメージ
FROM node:22-alpine AS runner

WORKDIR /app

# 本番依存だけ
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev

# ビルド成果物コピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/index.js"]
