import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { getToken } from "../lib/auth";
// TODO Ch12-login-ui handleSubmit を実装するときに次の import が必要になる
// import { useNavigate } from "react-router-dom";
// import { apiPost, formatApiError } from "../lib/api";
// import { setToken, updateCurrentUser } from "../lib/auth";
// import type { AuthResponse } from "../types";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  /**
   * TODO Ch12-login-ui ログイン処理を実装する
   *
   * ヒント
   *   1. apiPost<AuthResponse>("/api/auth/login", { email, password }, { skipAuthRedirect: true })
   *      でログイン API を呼ぶ
   *   2. 成功したら setToken(res.token) で JWT を保存し、updateCurrentUser(res.user) でユーザーを反映
   *   3. navigate("/", { replace: true }) でタスク一覧へ遷移する
   *   4. 失敗時 (401 など) は catch で setError(formatApiError(err)) を呼んでエラーを表示
   *   5. submitting state を try の前後で true / false に切り替え、二重送信を防ぐ
   *
   * 学習ポイント
   *   - ログイン画面では skipAuthRedirect を true にして 401 でのフルリロードを防ぐ
   *   - setSubmitting は finally で必ず false に戻す (失敗時にボタンが固まらないように)
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    throw new Error("Not implemented yet — see chapter 12-login-ui");
  }

  return (
    <div className="min-h-full flex items-center justify-center p-4 bg-canvas">
      <div className="w-full max-w-md">
        {/* タイトル */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-ink mb-2">タスクアプリ</h1>
          <p className="text-sm text-ink/60">タスク管理をもっとシンプルに</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* メール */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">メールアドレス</label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand pointer-events-none"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="example@mail.com"
                className="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
          </div>

          {/* パスワード */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">パスワード</label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand pointer-events-none"
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="・・・・・・・・"
                className="w-full rounded-xl border border-gray-300 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* ログインボタン */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand hover:bg-brand-hover disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition mt-2"
          >
            {submitting ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/60 text-center">
          アカウントをお持ちでない方は{" "}
          <Link to="/signup" className="text-brand hover:underline font-bold">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
