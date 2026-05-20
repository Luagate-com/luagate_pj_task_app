import { useState } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";
import type { Priority, Status, Task } from "../types";
// TODO Ch14-modals handleSubmit を実装するときに次の import が必要になる
// import { apiPost, formatApiError } from "../lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (task: Task) => void;
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "not_started", label: "未着手" },
  { value: "in_progress", label: "進行中" },
  { value: "completed", label: "完了" },
];

// onCreated は handleSubmit 完成時に props から受け取って使う
export function CreateTaskModal({ open, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<Status>("not_started");
  const [submitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  /**
   * TODO Ch14-modals 新規タスクを作成する
   *
   * ヒント
   *   1. apiPost<Task>("/api/tasks", { title, description: description || null,
   *      status, priority, dueDate: dueDate || null }) で作成 API を呼ぶ
   *   2. 成功したら onCreated(task) で親に通知し、入力欄を reset してから onClose()
   *   3. 失敗したら catch で setError(formatApiError(err)) を呼ぶ
   *      (409 のときは「同じタイトルのタスクが既にあります」など分岐してもよい)
   *   4. submitting state を try の前後で true / false に切り替え、二重送信を防ぐ
   *
   * 学習ポイント
   *   - 空文字は description: description || null のように null へ正規化する
   *   - reset は onCreated のあと onClose の前に行う (次回開いたとき前回値を残さない)
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    throw new Error("Not implemented yet — see chapter 14-modals");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[640px] overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="text-2xl font-bold text-ink">新規タスク作成</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-ink-sub hover:bg-surface-second"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              タイトル <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タスクのタイトルを入力"
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">詳細</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="タスクの詳細を入力してください"
              className="w-full resize-none rounded-lg border border-line px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">期限</label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-line px-3 py-2.5 pr-10 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                <Calendar
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-sub"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">優先度</label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full appearance-none rounded-lg border border-line bg-white px-3 py-2.5 pr-10 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                >
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-sub"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">ステータス</label>
            <div className="grid grid-cols-3 gap-3">
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "border-brand bg-brand/5 text-brand"
                        : "border-line bg-white text-ink hover:bg-surface-second"
                    }`}
                  >
                    <span
                      className={`inline-flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                        active ? "border-brand" : "border-ink-disabled"
                      }`}
                    >
                      {active && <span className="h-2 w-2 rounded-full bg-brand" />}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line bg-surface px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line bg-white px-5 py-2 text-sm font-medium text-ink hover:bg-surface-second"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={submitting || !title}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-ink-disabled"
          >
            {submitting ? "作成中..." : "作成する"}
          </button>
        </div>
      </form>
    </div>
  );
}
