import { Calendar, Clock, RefreshCw, X } from "lucide-react";
import type { Task } from "../types";
import { StatusBadge } from "./StatusBadge";
import { PriorityLabel } from "./PriorityLabel";
import { formatDateJa, formatDateTime } from "../lib/format";

interface Props {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskDetailModal({ task, onClose, onEdit, onDelete }: Props) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[720px] overflow-hidden rounded-xl bg-white shadow-xl">
        {/* 緑ヘッダー */}
        <div className="bg-brand px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">タスク詳細</h2>
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

        {/* ボディ */}
        <div className="space-y-6 px-6 py-6">
          <h3 className="text-2xl font-bold text-ink">{task.title}</h3>

          <div>
            <div className="mb-1.5 text-sm font-medium text-ink-sub">ステータス</div>
            <StatusBadge status={task.status} size="md" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="mb-1.5 text-sm font-medium text-ink-sub">期限</div>
              <div className="inline-flex items-center gap-2 text-sm text-ink">
                <Calendar size={16} className="text-ink-sub" />
                {formatDateJa(task.dueDate)}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-sm font-medium text-ink-sub">優先度</div>
              <PriorityLabel priority={task.priority} />
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-sm font-medium text-ink-sub">詳細説明</div>
            <div className="whitespace-pre-wrap rounded-lg bg-[#f9f9f9] px-4 py-3 text-sm text-ink">
              {task.description || "（詳細はありません）"}
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-end gap-3 border-t border-line bg-surface px-6 py-4">
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="rounded-lg border border-danger bg-white px-5 py-2 text-sm font-medium text-danger hover:bg-danger-light"
          >
            削除する
          </button>
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            編集する
          </button>
        </div>
      </div>
    </div>
  );
}
