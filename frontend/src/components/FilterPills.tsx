import type { Status } from "../types";

export type FilterKey = "all" | Status;

interface Props {
  current: FilterKey;
  counts: Record<FilterKey, number>;
  onChange: (key: FilterKey) => void;
}

const PILLS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "not_started", label: "未着手" },
  { key: "in_progress", label: "進行中" },
  { key: "completed", label: "完了" },
];

export function FilterPills({ current, counts, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PILLS.map((p) => {
        const active = current === p.key;
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => onChange(p.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-brand text-white"
                : "bg-white text-ink hover:bg-surface-second border border-line"
            }`}
          >
            <span>{p.label}</span>
            <span className={active ? "text-white/90" : "text-ink-sub"}>
              ({counts[p.key] ?? 0})
            </span>
          </button>
        );
      })}
    </div>
  );
}
