import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { UserStatusFilter } from "../../components/Admin/users/UserStatusTabs";
import { useToast } from "../../components/common/toastContext";
import useDelayedLoad from "../../components/common/useDelayedLoad";
import { getErrorMessage } from "../../api";
import { adminUserService, type AdminUserCreateInput } from "../../services/user/adminUserService";
import { roleLabel, type AdminUser, type AdminUserStats, type RoleOption } from "../../types/admin/adminUser.types";

const PAGE_SIZE = 10;
const EMPTY_STATS: AdminUserStats = { all: 0, active: 0, inactive: 0, locked: 0 };

// Trang quản lý người dùng: tìm kiếm, lọc trạng thái / vai trò / ngày tạo, khóa / mở khóa, tạo tài khoản, đổi vai trò
export function useAdminUsers() {
  const toast = useToast();
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<UserStatusFilter>("all");
  const [roleId, setRoleId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [viewing, setViewing] = useState<AdminUser | null>(null);
  const [locking, setLocking] = useState<AdminUser | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);

  useEffect(() => {
    adminUserService.roles().then(setRoles).catch(() => undefined);
  }, []);

  const loadStats = useCallback(() => adminUserService.stats().then(setStats).catch(() => undefined), []);
  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  // Chờ 1 giây (có skeleton) rồi mới gọi API khi đổi trang / bộ lọc; lần vào đầu tiên gọi ngay
  const list = useDelayedLoad(JSON.stringify([keyword, status, roleId, from, to, page]), () =>
    adminUserService.search({
      keyword,
      status: status === "all" ? null : status,
      roleId: roleId ? Number(roleId) : null,
      from,
      to,
      page,
      size: PAGE_SIZE,
    }),
  );

  // Tìm khi bấm nút "Tìm kiếm" hoặc Enter; xóa hết chữ thì hiện lại toàn bộ danh sách ngay
  const search = (e: FormEvent) => {
    e.preventDefault();
    // Bấm lại với cùng từ khóa thì tải lại kết quả
    if (input.trim() === keyword) return list.reload();
    setKeyword(input.trim());
    setPage(0);
  };
  const changeInput = (value: string) => {
    setInput(value);
    if (!value.trim() && keyword) {
      setKeyword("");
      setPage(0);
    }
  };

  const refresh = () => {
    list.reload();
    void loadStats();
  };

  const total = list.data?.totalElements ?? 0;

  // Đổi bộ lọc nào cũng quay về trang đầu
  const withFirstPage =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(0);
    };

  const resetFilters = () => {
    setInput("");
    setKeyword("");
    setStatus("all");
    setRoleId("");
    setFrom("");
    setTo("");
    setPage(0);
  };

  const setLocked = async (u: AdminUser, locked: boolean) => {
    setBusyId(u.id);
    try {
      await adminUserService.setLocked(u.id, locked);
      toast.show(locked ? `Đã khóa tài khoản ${u.fullName ?? u.email}` : `Đã mở khóa tài khoản ${u.fullName ?? u.email}`);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  const confirmLock = async () => {
    if (!locking) return;
    await setLocked(locking, true);
    setLocking(null);
  };

  // Tạo xong: đóng form, mở chi tiết tài khoản vừa tạo và tải lại danh sách + thẻ đếm
  const createUser = async (values: AdminUserCreateInput) => {
    setCreateBusy(true);
    try {
      const created = await adminUserService.createUser(values);
      toast.show(`Đã tạo tài khoản ${created.fullName ?? created.email}`);
      setCreating(false);
      setViewing(created);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setCreateBusy(false);
    }
  };

  const changeRole = async (u: AdminUser, nextRoleId: number) => {
    try {
      const saved = await adminUserService.changeRole(u.id, nextRoleId);
      toast.show(`Đã đổi vai trò của ${u.fullName ?? u.email} thành ${roleLabel(saved.role?.name)}`);
      setViewing(saved);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    }
  };

  return {
    list,
    items: list.data?.content ?? [],
    total,
    pages: list.data?.totalPages ?? 1,
    rangeFrom: total === 0 ? 0 : page * PAGE_SIZE + 1,
    rangeTo: Math.min(total, (page + 1) * PAGE_SIZE),
    page,
    setPage,
    pageSize: PAGE_SIZE,
    input,
    changeInput,
    search,
    status,
    changeStatus: withFirstPage(setStatus),
    roleId,
    changeRoleId: withFirstPage(setRoleId),
    from,
    changeFrom: withFirstPage(setFrom),
    to,
    changeTo: withFirstPage(setTo),
    badRange: from !== "" && to !== "" && from > to,
    hasFilter: input.trim() !== "" || status !== "all" || roleId !== "" || from !== "" || to !== "",
    resetFilters,
    stats,
    roles,
    viewing,
    setViewing,
    locking,
    setLocking,
    busyId,
    creating,
    setCreating,
    createBusy,
    setLocked,
    confirmLock,
    createUser,
    changeRole,
  };
}
