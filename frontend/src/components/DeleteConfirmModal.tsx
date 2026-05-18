import { useState } from "react";
import { AlertTriangle, Calendar } from "lucide-react";
import type { Task } from "../types";
import { apiDelete, formatApiError } from "../lib/api";
import { formatDate } from "../lib/format";

interface Props {
  task: Task | null;
  onClose: () => void;
  onDeleted: (task: Task) => void;
}

export function DeleteConfirmModal({ task, onClose, onDeleted }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!task) return null;

  async function handleDelete() {
    if (!task) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiDelete(`/api/tasks/${task.id}`);
      onDeleted(task);
      onClose();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[480px] overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="px-6 pt-8 pb-6 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-danger-light text-danger">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-bold text-ink">タスクを削除しますか？</h2>
          <p className="mt-1.5 text-sm text-ink-sub">この操作は取り消すことができません。</p>

          <div className="mt-5 rounded-lg border border-danger/30 bg-danger-light px-4 py-3 text-left">
            <div className="text-xs font-medium text-danger">タスク名</div>
            <div className="mt-1 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 text-sm font-semibold text-ink">{task.title}</div>
              {task.dueDate && (
                <div className="inline-flex shrink-0 items-center gap-1 text-xs text-ink-sub">
                  <Calendar size={12} />
                  {formatDate(task.dueDate)}
                </div>
              )}
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
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
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="rounded-lg bg-danger px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "削除中..." : "削除する"}
          </button>
        </div>
      </div>
    </div>
  );
}
