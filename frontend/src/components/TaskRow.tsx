import { Calendar } from "lucide-react";
import type { Task } from "../types";
import { PriorityLabel, priorityBarColor } from "./PriorityLabel";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "../lib/format";

interface Props {
  task: Task;
  onClick: (task: Task) => void;
}

export function TaskRow({ task, onClick }: Props) {
  const completed = task.status === "completed";
  return (
    <button
      type="button"
      onClick={() => onClick(task)}
      className={`w-full rounded-xl border border-line bg-white p-5 text-left transition hover:border-brand/40 hover:shadow-sm ${
        completed ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        {/* 優先度バー */}
        <span
          className="mt-1 inline-block w-1.5 shrink-0 rounded-full"
          style={{ height: 40, backgroundColor: priorityBarColor(task.priority) }}
        />

        {/* 本体 */}
        <div className="min-w-0 flex-1">
          <h3
            className={`truncate text-base font-semibold ${
              completed ? "text-ink-sub line-through" : "text-ink"
            }`}
          >
            {task.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1 text-sm ${
                completed ? "text-ink-disabled" : "text-ink-sub"
              }`}
            >
              <Calendar size={14} />
              {formatDate(task.dueDate)}
            </span>
            <PriorityLabel priority={task.priority} />
          </div>
          {task.description && (
            <p
              className={`mt-2 line-clamp-2 text-sm ${
                completed ? "text-ink-disabled" : "text-ink-sub"
              }`}
            >
              {task.description}
            </p>
          )}
        </div>

        {/* ステータス */}
        <div className="shrink-0">
          <StatusBadge status={task.status} withPullDown size="md" />
        </div>
      </div>
    </button>
  );
}
