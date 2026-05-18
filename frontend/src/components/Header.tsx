import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearToken, useCurrentUser } from "../lib/auth";

export function Header() {
  const user = useCurrentUser();
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <h1 className="text-lg font-bold text-ink">タスクアプリ</h1>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-surface-second px-4 py-1.5 text-sm font-medium text-ink">
            {user?.displayName ?? "ゲスト"}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-1.5 text-sm font-medium text-ink hover:bg-surface-second"
          >
            <LogOut size={16} />
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
