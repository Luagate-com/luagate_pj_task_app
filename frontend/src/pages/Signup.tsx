import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiPost, formatApiError } from "../lib/api";
import { getToken, setToken, updateCurrentUser } from "../lib/auth";
import type { AuthResponse } from "../types";

export function Signup() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== passwordConfirm) {
      setError("パスワードが一致しません");
      return;
    }
    if (!agreed) {
      setError("利用規約への同意が必要です");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiPost<AuthResponse>(
        "/api/auth/signup",
        { email, password, displayName },
        { skipAuthRedirect: true },
      );
      setToken(res.token);
      updateCurrentUser(res.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-ink mb-2">新規登録</h1>
          <p className="text-sm text-ink-sub">アカウントを作成してタスク管理を始めましょう</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">氏名</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="山田花子"
              className="w-full rounded-xl border border-line px-3.5 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">メールアドレス</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="example@mail.com"
              className="w-full rounded-xl border border-line px-3.5 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">パスワード</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="・・・・・・・・"
              className="w-full rounded-xl border border-line px-3.5 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">パスワード（確認）</label>
            <input
              type="password"
              required
              minLength={8}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
              placeholder="・・・・・・・・"
              className="w-full rounded-xl border border-line px-3.5 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>

          <label className="flex items-start gap-2.5 pt-1 text-sm text-ink-sub">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-line text-brand focus:ring-brand"
            />
            <span>
              <span className="text-brand font-medium">利用規約</span>と
              <span className="text-brand font-medium">プライバシーポリシー</span>に同意します
            </span>
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand hover:bg-brand-hover disabled:bg-ink-disabled text-white font-bold py-3 rounded-xl transition mt-2"
          >
            {submitting ? "登録中..." : "アカウントを作成"}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink-sub text-center">
          すでにアカウントをお持ちの方は{" "}
          <Link to="/login" className="text-brand hover:underline font-bold">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
