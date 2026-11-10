import { Link, useParams } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import UserPasswordForm from "../../../components/Admin/users/UserPasswordForm";
import Avatar from "../../../components/common/Avatar";
import { useAdminUserDetail, useAdminUserForm } from "../../../hooks/admin/useAdminUserForm";
import { USER_STATUS_LABEL, isProjectRole, roleLabel, type AdminUser, type RoleOption } from "../../../types/admin/adminUser.types";

const crumb = [
  { label: "Tổng quan", to: "/admin/dashboard" },
  { label: "Hệ thống" },
  { label: "Quản lý người dùng", to: "/admin/users" },
];

const input =
  "h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100 disabled:bg-primary-50/40 disabled:text-body aria-[invalid=true]:border-danger";

// Trang sửa người dùng (/admin/users/:id/edit): thông tin tài khoản + vai trò, đổi mật khẩu ở mục riêng
export default function AdminUserFormPage() {
  const { id } = useParams();
  const userId = Number(id);
  const { load, roles, savedCount, handleSaved } = useAdminUserDetail(userId);

  if (!Number.isFinite(userId) || load.status === "error") {
    return (
      <div className="px-4 py-24 text-center" role="alert">
        <p className="text-xl font-semibold text-heading">Không tìm thấy người dùng</p>
        <Link to="/admin/users" className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700">
          Về danh sách người dùng
        </Link>
      </div>
    );
  }
  if (load.status === "loading") {
    return (
      <div className="animate-pulse px-4 py-10 md:px-8" aria-busy="true" aria-label="Đang tải người dùng">
        <div className="h-32 rounded-2xl bg-primary-100" />
        <div className="mt-6 h-96 rounded-2xl bg-primary-50" />
      </div>
    );
  }

  return <UserForm key={`${load.user.id}-${savedCount}`} user={load.user} roles={roles} onSaved={handleSaved} />;
}

type FormProps = { user: AdminUser; roles: RoleOption[]; onSaved: (saved: AdminUser) => void };

function UserForm({ user, roles, onSaved }: FormProps) {
  const {
    isMe, locked, projectRole, fullName, setFullName, email, setEmail, phone, setPhone,
    roleId, setRoleId, active, setActive, accountLocked, setAccountLocked,
    saving, passwordDirty, setPasswordDirty, infoDirty, guard, show, submit, name,
  } = useAdminUserForm(user, onSaved);

  return (
    <>
      <AdminPageHeader breadcrumb={[...crumb, { label: "Sửa người dùng" }]} title="Sửa người dùng" desc={`Chỉnh sửa thông tin tài khoản của ${name}.`}>
        {(infoDirty || passwordDirty) && (
          <p role="status" className="mt-4 flex items-center gap-2 rounded-lg border border-warning/40 bg-amber-100 px-4 py-2.5 text-xs font-semibold text-warning">
            <span className="h-2 w-2 rounded-full bg-warning" /> Có thay đổi chưa lưu
          </p>
        )}
      </AdminPageHeader>

      <div className="-mt-16 space-y-5 px-4 pb-10 md:px-8">
        <form onSubmit={submit} noValidate className="rounded-2xl border border-line bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-4 border-b border-line p-6">
            <Avatar src={user.avatarUrl} fullName={name} className="h-14 w-14" />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-footer">Thông tin tài khoản</h2>
              <p className="mt-1 text-sm text-body">
                {USER_STATUS_LABEL[user.status]} · {roleLabel(user.role?.name)}
                {isMe && " · Đây là tài khoản của bạn"}
              </p>
            </div>
          </div>

          <div className="grid gap-x-8 gap-y-5 p-6 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-footer">Họ và tên <span className="text-danger">*</span></span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} disabled={saving || locked}aria-invalid={show("fullName") ? true : undefined} className={`${input} mt-1.5`} />
              {show("fullName") && <span role="alert" className="mt-1 block text-xs text-danger">{show("fullName")}</span>}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-footer">Vai trò <span className="text-danger">*</span></span>
              <span className="relative mt-1.5 block">
                {locked || projectRole ? (
                  // Tài khoản Quản trị hệ thống / vai trò dự án: chỉ hiện chữ, không có ô chọn
                  <input value={roleLabel(user.role?.name)} readOnly disabled className={input} />
                ) : (
                  <>
                    <select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))} disabled={saving || isMe} className={`${input} appearance-none pr-10`}>
                      {!user.role && <option value={0}>— Chọn vai trò —</option>}
                      {/* Vai trò dự án không có trong danh sách chọn: vẫn hiện vai trò hiện tại */}
                      {user.role && isProjectRole(user.role.name) && (
                        <option value={user.role.id} disabled>{roleLabel(user.role.name)}</option>
                      )}
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{roleLabel(r.name)}</option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  </>
                )}
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-footer">Email <span className="text-danger">*</span></span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={100} disabled={saving || isMe || locked}aria-invalid={show("email") ? true : undefined} className={`${input} mt-1.5`} />
              {show("email") && <span role="alert" className="mt-1 block text-xs text-danger">{show("email")}</span>}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-footer">Số điện thoại <span className="text-xs font-normal text-muted">(Không bắt buộc)</span></span>
              <input inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} disabled={saving || isMe || locked}aria-invalid={show("phone") ? true : undefined} className={`${input} mt-1.5`} />
              {show("phone") && <span role="alert" className="mt-1 block text-xs text-danger">{show("phone")}</span>}
            </label>

            {/* Tắt kích hoạt / khóa: người dùng không đăng nhập được và bị đăng xuất khỏi mọi thiết bị */}
            <SwitchCard
              title="Kích hoạt tài khoản"
              checked={active}
              onChange={setActive}
              disabled={saving || isMe || locked}
              tone="success"
              desc={active
                ? "Đang bật: người dùng đăng nhập và sử dụng bình thường."
                : "Đang tắt: người dùng không đăng nhập được; lưu lại sẽ đăng xuất họ khỏi mọi thiết bị."}
            />
            <SwitchCard
              title="Khóa tài khoản"
              checked={accountLocked}
              onChange={setAccountLocked}
              disabled={saving || isMe || locked}
              tone="danger"
              desc={accountLocked
                ? "Đang khóa: người dùng không đăng nhập được; lưu lại sẽ đăng xuất họ khỏi mọi thiết bị."
                : "Không khóa: tài khoản hoạt động theo trạng thái kích hoạt."}
            />
          </div>

          <p className="px-6 text-xs text-muted">
            {locked
              ? "Đây là tài khoản Quản trị hệ thống, chỉ Quản trị hệ thống mới sửa được."
              : isMe
                ? "Bạn chỉ đổi được họ tên của chính mình; email, số điện thoại, vai trò, kích hoạt và khóa tài khoản cần một quản trị viên khác đổi."
                : "Đổi email, số điện thoại hoặc vai trò sẽ đăng xuất người này khỏi mọi thiết bị."}
          </p>

          <div className="flex justify-end gap-3 p-6">
            <button
              type="button"
              onClick={() => guard.requestLeave("/admin/users")}
              disabled={saving}
              className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-footer transition hover:bg-primary-50 disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              disabled={saving || !infoDirty || locked}
              className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>

        {!locked && <UserPasswordForm userId={user.id} isMe={isMe} onDirtyChange={setPasswordDirty} />}
      </div>

      {guard.target && (
        <ConfirmDialog
          title="Rời khỏi trang?"
          message="Bạn có thay đổi chưa lưu. Nếu rời đi, các thay đổi này sẽ bị mất."
          confirmLabel="Rời trang"
          onConfirm={guard.leave}
          onClose={guard.stay}
        />
      )}
    </>
  );
}

type SwitchCardProps = {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
  tone: "success" | "danger"; // màu khi đang bật
};

// Thẻ bật/tắt (giống ô "Hiển thị bài trên bảng tin" bên trang bài đăng)
function SwitchCard({ title, desc, checked, onChange, disabled, tone }: SwitchCardProps) {
  const on = tone === "success"
    ? { card: "border-success/40 bg-success/5", track: "bg-success" }
    : { card: "border-danger/40 bg-danger/5", track: "bg-danger" };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`flex w-full items-center justify-between gap-4 rounded-2xl border-2 p-5 text-left transition disabled:opacity-60 ${
        checked ? on.card : "border-line bg-primary-50/40"
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-footer">{title}</span>
        <span className="mt-1 block text-sm text-body">{desc}</span>
      </span>
      <span className={`relative inline-flex h-9 w-16 shrink-0 items-center rounded-full transition ${checked ? on.track : "bg-muted"}`}>
        <span className={`inline-block h-7 w-7 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-8" : "translate-x-1"}`} />
      </span>
    </button>
  );
}
