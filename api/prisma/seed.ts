import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 既存データ削除 (開発用)
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // デモユーザー (3 人)
  const password = await bcrypt.hash("password123", 10);
  const alice = await prisma.user.create({
    data: { email: "alice@example.com", passwordHash: password, displayName: "Alice 山田" },
  });
  const bob = await prisma.user.create({
    data: { email: "bob@example.com", passwordHash: password, displayName: "Bob 鈴木" },
  });
  const carol = await prisma.user.create({
    data: { email: "carol@example.com", passwordHash: password, displayName: "Carol 田中" },
  });

  // Alice のタスク (5 件)
  await prisma.task.createMany({
    data: [
      {
        userId: alice.id,
        title: "ECサイトのリニューアル設計",
        description: "ユーザーインターフェースの改善とモバイル対応を含む全面的なリニューアル",
        status: "in_progress",
        priority: "high",
        dueDate: new Date("2026-01-31T23:59:59.000Z"),
      },
      {
        userId: alice.id,
        title: "データベース最適化",
        description: "パフォーマンス改善のためのインデックス追加とクエリ最適化",
        status: "not_started",
        priority: "medium",
        dueDate: new Date("2026-02-05T23:59:59.000Z"),
      },
      {
        userId: alice.id,
        title: "月次レポート作成",
        description: "1月分のプロジェクト進捗レポートを作成し提出",
        status: "completed",
        priority: "low",
        dueDate: new Date("2026-01-28T23:59:59.000Z"),
      },
      {
        userId: alice.id,
        title: "APIドキュメントの整備",
        description: "REST API のエンドポイント仕様を OpenAPI 形式でまとめる",
        status: "in_progress",
        priority: "medium",
        dueDate: new Date("2026-02-10T23:59:59.000Z"),
      },
      {
        userId: alice.id,
        title: "チームミーティングの議事録共有",
        description: "週次定例の議事録を Notion にまとめてチームへ共有",
        status: "completed",
        priority: "low",
        dueDate: new Date("2026-01-20T23:59:59.000Z"),
      },
    ],
  });

  // Bob のタスク (3 件)
  await prisma.task.createMany({
    data: [
      {
        userId: bob.id,
        title: "認証機能のリファクタリング",
        description: "JWT のリフレッシュトークン対応とエラーハンドリングの改善",
        status: "in_progress",
        priority: "high",
        dueDate: new Date("2026-02-03T23:59:59.000Z"),
      },
      {
        userId: bob.id,
        title: "CI/CD パイプラインの構築",
        description: "GitHub Actions で自動テストとデプロイのパイプラインを整備",
        status: "not_started",
        priority: "medium",
        dueDate: new Date("2026-02-15T23:59:59.000Z"),
      },
      {
        userId: bob.id,
        title: "本番障害の調査レポート",
        description: "先週発生した API レスポンス遅延の原因分析と再発防止策",
        status: "completed",
        priority: "high",
        dueDate: new Date("2026-01-25T23:59:59.000Z"),
      },
    ],
  });

  // Carol のタスク (3 件)
  await prisma.task.createMany({
    data: [
      {
        userId: carol.id,
        title: "デザインシステムの更新",
        description: "Figma のコンポーネントライブラリを v2 仕様に揃える",
        status: "in_progress",
        priority: "high",
        dueDate: new Date("2026-02-08T23:59:59.000Z"),
      },
      {
        userId: carol.id,
        title: "ユーザーインタビューの実施",
        description: "新機能リリース前にターゲットユーザー 5 名にインタビュー",
        status: "not_started",
        priority: "medium",
        dueDate: new Date("2026-02-20T23:59:59.000Z"),
      },
      {
        userId: carol.id,
        title: "アクセシビリティ改善",
        description: "WCAG 2.1 AA 準拠に向けたカラーコントラストとキーボード操作の見直し",
        status: "not_started",
        priority: "low",
        dueDate: new Date("2026-02-28T23:59:59.000Z"),
      },
    ],
  });

  const taskCount = await prisma.task.count();
  console.log("Seed completed");
  console.log("  3 users — alice@example.com / bob@example.com / carol@example.com (password: password123)");
  console.log(`  ${taskCount} tasks (Alice 5 / Bob 3 / Carol 3)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
