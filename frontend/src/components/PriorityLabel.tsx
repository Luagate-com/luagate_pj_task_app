import type { Priority } from "../types";

const LABEL: Record<Priority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const STYLE: Record<Priority, { bg: string; color: string }> = {
  high: { bg: "rgba(241,80,37,0.1)", color: "#F15025" },
  medium: { bg: "rgba(242,183,5,0.12)", color: "#B88A00" },
  low: { bg: "rgba(5,180,91,0.1)", color: "#05B45B" },
};

export function PriorityLabel({ priority }: { priority: Priority }) {
  const s = STYLE[priority];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {LABEL[priority]}
    </span>
  );
}

export function priorityBarColor(priority: Priority): string {
  switch (priority) {
    case "high":
      return "#F15025";
    case "medium":
      return "#F2B705";
    case "low":
      return "#05B45B";
  }
}

export const PRIORITY_LABEL = LABEL;
