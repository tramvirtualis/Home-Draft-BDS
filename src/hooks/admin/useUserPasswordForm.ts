import { useEffect, useState, type FormEvent } from "react";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminUserService } from "../../services/user/adminUserService";
import { PASSWORD_RULE } from "../../types/admin/adminUser.types";

// Đặt mật khẩu mới cho tài khoản: mật khẩu hiện tại không bao giờ hiện ra, ô luôn bắt đầu trống
export function useUserPasswordForm(userId: number, isMe: boolean, onDirtyChange: (dirty: boolean) => void) {
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  // Còn chữ trong ô mật khẩu thì coi là chưa lưu (để trang cảnh báo khi rời đi)
  useEffect(() => {
    onDirtyChange(password !== "" || confirm !== "");
  }, [password, confirm, onDirtyChange]);

  const ruleError = password && !PASSWORD_RULE.test(password) ? "Tối thiểu 8 ký tự, chỉ gồm chữ và số, có ít nhất một chữ cái và một số" : undefined;
  const confirmError = confirm && confirm !== password ? "Mật khẩu xác nhận không khớp" : undefined;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTouched(true);
    if (!password || !confirm || ruleError || confirmError) {
      toast.show("Vui lòng nhập mật khẩu mới hợp lệ và xác nhận trùng khớp", "error");
      return;
    }
    setSaving(true);
    try {
      await adminUserService.changePassword(userId, password, confirm);
      toast.show(isMe ? "Đã đổi mật khẩu, hãy đăng nhập lại bằng mật khẩu mới" : "Đã đổi mật khẩu");
      setPassword("");
      setConfirm("");
      setTouched(false);
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return { password, setPassword, confirm, setConfirm, saving, touched, ruleError, confirmError, submit };
}
