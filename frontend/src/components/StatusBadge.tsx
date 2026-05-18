import { ChevronDown } from "lucide-react";
import type { Status } from "../types";

const LABEL: Record<Status, string> = {
  not_started: "未着手",
  in_progress: "進行中",
  completed: "完了",
};

const STYLE: Record<Status, { bg: string; color: string }> = {
  not_started: { bg: "rgba(5,180,91,0.1)", color: "#05B45B" },
  in_progress: { bg: "rgba(242,183,5,0.1)", color: "#F2B705" },
  completed: { bg: "rgba(174,173,169,0.1)", color: "#737373" },
};

interface Props {
  status: Status;
  withPullDown?: boolean;
  size?: "sm" | "md";
}

export function StatusBadge({ status, withPullDown, size = "sm" }: Props) {
  const s = STYLE[status];
  const padding = size === "md" ? "px-3 py-1.5" : "px-2.5 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full text-xs font-semibold ${padding}`}
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {LABEL[status]}
      {withPullDown && <ChevronDown size={12} />}
    </span>
  );
}

export const STATUS_LABEL = LABEL;
