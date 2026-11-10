import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminRoleService } from "../../services/admin/adminRoleService";
import { splitPermission, type Permission, type RoleDetail } from "../../types/admin/role.types";
import useFormDraft from "../useFormDraft";

const NAME_RULE = /^[A-Za-z0-9_]+$/;

type Load =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; roles: RoleDetail[]; permissions: Permission[] };

// Trang phân quyền: tải danh sách vai trò + quyền, xóa vai trò
export function useAdminRoles() {
  const toast = useToast();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);
  // undefined = đóng, null = tạo mới
  const [editing, setEditing] = useState<RoleDetail | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<RoleDetail | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminRoleService.list(), adminRoleService.permissions()])
      .then(
        ([roles, permissions]) =>
          !cancelled && setLoad({ status: "ready", roles, permissions })
      )
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);

  const retry = () => {
    setLoad({ status: "loading" });
    refresh();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminRoleService.remove(deleting.id);
      toast.show(`Đã xóa vai trò ${deleting.name}`);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  };

  return { load, editing, setEditing, deleting, setDeleting, busy, refresh, retry, confirmDelete };
}

// Form tạo / sửa vai trò: tên + tick quyền. role = null: tạo mới
export function useRoleForm(role: RoleDetail | null, permissions: Permission[], onSaved: () => void) {
  const toast = useToast();
  const allCodes = useMemo(() => permissions.map((p) => p.code), [permissions]);
  const [name, setName] = useState(role ? role.name.replace(/^ROLE_/, "") : "");
  // Role hệ thống (Admin / Giám đốc dự án) chỉ sửa quyền, tên giữ nguyên
  const nameLocked = role?.system ?? false;
  const [selected, setSelected] = useState<Set<string>>(new Set(role?.permissions ?? []));
  const [saving, setSaving] = useState(false);
  const draft = useFormDraft("role", role?.id, { name, selected: [...selected].sort() }, (d) => {
    setName(d.name);
    setSelected(new Set(d.selected));
  });

  const allChecked = allCodes.length > 0 && allCodes.every((c) => selected.has(c));

  // Tick "Thêm / sửa / xóa" thì tự tick "Xem" (không xem được danh sách thì không thao tác được);
  // bỏ "Xem" thì bỏ luôn mọi quyền khác của khu vực đó
  const toggle = (code: string, checked: boolean) => {
    const { module, action } = splitPermission(code);
    const view = `${module}_VIEW`;
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(code);
        if (action !== "VIEW" && allCodes.includes(view)) next.add(view);
      } else {
        next.delete(code);
        if (action === "VIEW") {
          for (const c of allCodes) if (splitPermission(c).module === module) next.delete(c);
        }
      }
      return next;
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.show("Vui lòng nhập tên vai trò", "error");
      return;
    }
    if (!NAME_RULE.test(trimmed)) {
      toast.show("Tên vai trò chỉ gồm chữ không dấu, số và dấu _", "error");
      return;
    }
    setSaving(true);
    try {
      const request = { name: trimmed, permissionCodes: [...selected] };
      if (role) await adminRoleService.edit(role.id, request);
      else await adminRoleService.add(request);
      draft.clear();
      toast.show(role ? "Đã cập nhật vai trò" : "Đã tạo vai trò");
      onSaved();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return { name, setName, nameLocked, selected, setSelected, saving, draft, allCodes, allChecked, toggle, submit };
}
