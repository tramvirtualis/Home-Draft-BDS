import { useEffect, useState, type FormEvent } from "react";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminUserService } from "../../services/user/adminUserService";
import { selectCurrentUser, selectIsSuperAdmin, useAppSelector } from "../../store";
import { EMAIL_RULE, PHONE_RULE, SUPER_ADMIN_ROLE_NAME, type AdminUser, type RoleOption } from "../../types/admin/adminUser.types";
import useUnsavedChangesGuard from "../useUnsavedChangesGuard";

type Load = { status: "loading" } | { status: "error" } | { status: "ready"; user: AdminUser };

// Tải người dùng cần sửa và danh sách vai trò cho trang /admin/users/:id/edit
export function useAdminUserDetail(userId: number) {
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    adminUserService.roles().then(setRoles).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!Number.isFinite(userId)) return;
    let cancelled = false;
    adminUserService
      .get(userId)
      .then((user) => !cancelled && setLoad({ status: "ready", user }))
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Lưu xong vẫn ở lại trang: nạp dữ liệu vừa lưu và dựng lại form
  const handleSaved = (saved: AdminUser) => {
    setLoad({ status: "ready", user: saved });
    setSavedCount((n) => n + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { load, roles, savedCount, handleSaved };
}

// Form thông tin tài khoản + vai trò
export function useAdminUserForm(user: AdminUser, onSaved: (saved: AdminUser) => void) {
  const toast = useToast();
  const me = useAppSelector(selectCurrentUser);
  const isMe = user.id === me?.id;
  // Tài khoản Quản trị hệ thống chỉ Quản trị hệ thống mới sửa được (BE cũng chặn): khóa toàn bộ form
  const viewerIsSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const locked = user.role?.name === SUPER_ADMIN_ROLE_NAME && !viewerIsSuperAdmin;
  // Đang phụ trách dự án: vai trò đổi qua trang Nhân sự dự án (gỡ khỏi các dự án thì tự về Người dùng)
  const projectRole = user.projectStaff;
  const [fullName, setFullName] = useState(user.fullName ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [roleId, setRoleId] = useState(user.role?.id ?? 0);
  const [active, setActive] = useState(user.active);
  const [accountLocked, setAccountLocked] = useState(user.status === "LOCKED");
  const [saving, setSaving] = useState(false);
  const [passwordDirty, setPasswordDirty] = useState(false);
  const [touched, setTouched] = useState(false);

  const infoDirty =
    fullName.trim() !== (user.fullName ?? "") ||
    email.trim() !== (user.email ?? "") ||
    phone.trim() !== (user.phone ?? "") ||
    roleId !== (user.role?.id ?? 0) ||
    active !== user.active ||
    accountLocked !== (user.status === "LOCKED");
  const guard = useUnsavedChangesGuard(infoDirty || passwordDirty);

  const errors = {
    fullName: !fullName.trim() ? "Nhập họ và tên" : undefined,
    email: !email.trim() ? "Nhập email" : !EMAIL_RULE.test(email.trim()) ? "Email không hợp lệ" : undefined,
    phone: phone.trim() && !PHONE_RULE.test(phone.trim()) ? "Số điện thoại không hợp lệ" : undefined,
    roleId: !roleId ? "Chọn vai trò" : undefined,
  };
  // Lỗi định dạng email / SĐT hiện ngay khi gõ; lỗi để trống chỉ hiện sau khi bấm Lưu
  const show = (k: keyof typeof errors) =>
    touched || (k === "email" && email.trim()) || (k === "phone" && phone.trim()) ? errors[k] : undefined;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.values(errors).some(Boolean)) {
      toast.show("Vui lòng kiểm tra lại các trường bị báo lỗi", "error");
      return;
    }
    setSaving(true);
    try {
      const saved = await adminUserService.edit(user.id, { fullName, email, phone, roleId, active, locked: accountLocked });
      toast.show("Đã lưu thông tin người dùng");
      onSaved(saved);
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
      setSaving(false);
    }
  };

  return {
    isMe,
    locked,
    projectRole,
    fullName,
    setFullName,
    email,
    setEmail,
    phone,
    setPhone,
    roleId,
    setRoleId,
    active,
    setActive,
    accountLocked,
    setAccountLocked,
    saving,
    passwordDirty,
    setPasswordDirty,
    infoDirty,
    guard,
    show,
    submit,
    name: user.fullName ?? "Chưa đặt tên",
  };
}
