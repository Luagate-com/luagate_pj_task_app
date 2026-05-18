import { useEffect, useState } from "react";
import { Calendar, ChevronDown, Clock, RefreshCw, X } from "lucide-react";
import type { Priority, Status, Task } from "../types";
import { apiPatch, formatApiError } from "../lib/api";
import { formatDateTime, toDateInputValue } from "../lib/format";

interface Props {
  task: Task | null;
  onClose: () => void;
  onSaved: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function EditTaskModal({ task, onClose, onSaved, onDelete }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<Status>("not_started");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setDueDate(toDateInputValue(task.dueDate));
      setPriority(task.priority);
      setStatus(task.status);
      setError(null);
    }
  }, [task]);

  if (!task) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!task) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await apiPatch<Task>(`/api/tasks/${task.id}`, {
        title,
        description: description || null,
        status,
        priority,
        dueDate: dueDate || null,
        version: task.version,
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[720px] overflow-hidden rounded-xl bg-white shadow-xl"
      >
        {/* 緑ヘッダー */}
        <div className="bg-brand px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">タスク編集</h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-white/90">
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} />
                  作成: {formatDateTime(task.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <RefreshCw size={12} />
                  更新: {formatDateTime(task.updatedAt)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-white/90 hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">タイトル</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">ステータス</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full appearance-none rounded-lg border border-line bg-white px-3 py-2.5 pr-10 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="not_started">未着手</option>
                <option value="in_progress">進行中</option>
                <option value="completed">完了</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-sub"
              />
            </div>
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
            <label className="mb-1.5 block text-sm font-medium text-ink">詳細</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-lg border border-line px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line bg-surface px-6 py-4">
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="rounded-lg border border-danger bg-white px-5 py-2 text-sm font-medium text-danger hover:bg-danger-light"
          >
            削除する
          </button>
          <button
            type="submit"
            disabled={submitting || !title}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-ink-disabled"
          >
            {submitting ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </div>
  );
}
