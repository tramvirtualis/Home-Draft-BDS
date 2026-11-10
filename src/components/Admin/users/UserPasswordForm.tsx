import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useUserPasswordForm } from "../../../hooks/admin/useUserPasswordForm";

type Props = {
  userId: number;
  isMe: boolean;
  onDirtyChange: (dirty: boolean) => void;
};

const input =
  "h-11 w-full rounded-xl border border-line bg-white pl-4 pr-11 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100 aria-[invalid=true]:border-danger";

function PasswordField({ label, value, onChange, error, autoFocus }: { label: string; value: string; onChange: (v: string) => void; error?: string; autoFocus?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="text-sm font-semibold text-footer">{label}</span>
      <span className="relative mt-1.5 block">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          className={input}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-primary-50 hover:text-heading"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
      {error && <span role="alert" className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

// Đặt mật khẩu mới cho tài khoản: mật khẩu hiện tại không bao giờ hiện ra, ô luôn bắt đầu trống
export default function UserPasswordForm({ userId, isMe, onDirtyChange }: Props) {
  const {
    password, setPassword, confirm, setConfirm, saving, touched, ruleError, confirmError, submit,
  } = useUserPasswordForm(userId, isMe, onDirtyChange);

  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <div className="border-b border-line p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-footer">
          <KeyRound size={20} className="text-primary-600" /> Đổi mật khẩu
        </h2>
        <p className="mt-1 text-sm text-body">
          Mật khẩu hiện tại được mã hóa nên không xem được. Nhập mật khẩu mới để thay; người dùng sẽ bị đăng xuất khỏi mọi thiết bị.
        </p>
      </div>
      <form onSubmit={submit} noValidate className="space-y-5 p-6">
        <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
          <PasswordField label="Mật khẩu mới" value={password} onChange={setPassword} error={ruleError} />
          <PasswordField
            label="Nhập lại mật khẩu mới"
            value={confirm}
            onChange={setConfirm}
            error={confirmError ?? (touched && !confirm ? "Vui lòng nhập lại mật khẩu" : undefined)}
          />
        </div>
        <div className="flex justify-end">
          <button
            disabled={saving || !password || !confirm}
            className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
          >
            {saving ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </div>
      </form>
    </section>
  );
}
