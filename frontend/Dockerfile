# ---- build stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# 依存関係インストール
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# ソース投入してビルド
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:3030}
RUN npm run build

# ---- runtime stage ----
FROM nginx:alpine

# SPA 用の nginx 設定 (history fallback)
RUN rm /etc/nginx/conf.d/default.conf
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静的ファイルは長期キャッシュ
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
