import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Header } from "../components/Header";
import { FilterPills, type FilterKey } from "../components/FilterPills";
import { TaskRow } from "../components/TaskRow";
import { CreateTaskModal } from "../components/CreateTaskModal";
import { TaskDetailModal } from "../components/TaskDetailModal";
import { EditTaskModal } from "../components/EditTaskModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { apiGet, formatApiError } from "../lib/api";
import type { Task } from "../types";

type ModalState =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "detail"; task: Task }
  | { kind: "edit"; task: Task }
  | { kind: "delete"; task: Task; fromEdit?: boolean };

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [modal, setModal] = useState<ModalState>({ kind: "none" });

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const list = await apiGet<Task[]>("/api/tasks");
        if (!cancel) {
          setTasks(list);
          setLoading(false);
        }
      } catch (err) {
        if (!cancel) {
          setError(formatApiError(err));
          setLoading(false);
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: tasks.length,
      not_started: 0,
      in_progress: 0,
      completed: 0,
    };
    for (const t of tasks) c[t.status]++;
    return c;
  }, [tasks]);

  const visible = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  function handleCreated(task: Task) {
    setTasks((prev) => [task, ...prev]);
  }

  function handleSaved(task: Task) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    setModal({ kind: "detail", task });
  }

  function handleDeleted(task: Task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setModal({ kind: "none" });
  }

  return (
    <div className="min-h-full bg-surface">
      <Header />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[28px] font-bold text-ink">タスク一覧</h1>
          <button
            type="button"
            onClick={() => setModal({ kind: "create" })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            <Plus size={16} />
            新規タスク
          </button>
        </div>

        <div className="mb-6">
          <FilterPills current={filter} counts={counts} onChange={setFilter} />
        </div>

        {loading ? (
          <div className="rounded-xl border border-line bg-white p-10 text-center text-sm text-ink-sub">
            読み込み中...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-danger/30 bg-danger-light p-6 text-sm text-danger">
            {error}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-line bg-white p-10 text-center text-sm text-ink-sub">
            タスクがありません
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                onClick={(task) => setModal({ kind: "detail", task })}
              />
            ))}
          </div>
        )}
      </main>

      <CreateTaskModal
        open={modal.kind === "create"}
        onClose={() => setModal({ kind: "none" })}
        onCreated={handleCreated}
      />

      <TaskDetailModal
        task={modal.kind === "detail" ? modal.task : null}
        onClose={() => setModal({ kind: "none" })}
        onEdit={(task) => setModal({ kind: "edit", task })}
        onDelete={(task) => setModal({ kind: "delete", task })}
      />

      <EditTaskModal
        task={modal.kind === "edit" ? modal.task : null}
        onClose={() => setModal({ kind: "none" })}
        onSaved={handleSaved}
        onDelete={(task) => setModal({ kind: "delete", task, fromEdit: true })}
      />

      <DeleteConfirmModal
        task={modal.kind === "delete" ? modal.task : null}
        onClose={() => setModal({ kind: "none" })}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
