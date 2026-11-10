import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../components/common/toastContext";
import useDelayedLoad from "../../components/common/useDelayedLoad";
import { getErrorMessage } from "../../api";
import { adminPostBackgroundService, type AdminPostBackgroundStats } from "../../services/social/postBackgroundService";
import type { PageResponse } from "../../types/common.types";
import type { AdminPostBackground, PostBackgroundInput } from "../../types/social/social.types";
import { clearPostBackgroundsCache } from "./usePostBackgrounds";

type Data = { page: PageResponse<AdminPostBackground>; stats: AdminPostBackgroundStats };
// undefined = đóng form, null = thêm mới
type Editing = AdminPostBackground | null | undefined;

const PAGE_SIZE = 10;

// Trang quản lý màu nền bài viết: phân trang, thêm / sửa, bật tắt, đổi thứ tự, xóa
export function useAdminPostBackgrounds() {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Editing>(undefined);
  const [deleting, setDeleting] = useState<AdminPostBackground | null>(null);
  const [busy, setBusy] = useState(false);

  // Lần đầu tải ngay; đổi trang / tải lại thì hiện skeleton, chờ 1s rồi mới gọi API (giống trang Bài viết, Người dùng)
  const list = useDelayedLoad<Data>(String(page), async () => {
    const [pageData, stats] = await Promise.all([
      adminPostBackgroundService.list(page, PAGE_SIZE),
      adminPostBackgroundService.stats(),
    ]);
    return { page: pageData, stats };
  });

  const data = list.data;
  const items = data?.page.content ?? [];
  const totalPages = data?.page.totalPages ?? 1;

  // Trang hiện tại trống (vừa xóa màu cuối cùng của trang cuối) thì lùi về trang trước
  useEffect(() => {
    if (!list.waiting && data && data.page.content.length === 0 && page > 0) setPage(page - 1);
  }, [list.waiting, data, page]);

  // Sau mỗi thay đổi: tải lại trang + thống kê, xóa cache để ô đăng bài lấy danh sách mới
  const { reload } = list;
  const refresh = useCallback(() => {
    clearPostBackgroundsCache();
    reload();
  }, [reload]);

  const save = async (input: PostBackgroundInput) => {
    setBusy(true);
    try {
      if (editing) {
        await adminPostBackgroundService.updateBackground(editing.id, input);
        toast.show("Đã cập nhật màu nền");
      } else {
        await adminPostBackgroundService.createBackground(input);
        toast.show("Đã thêm màu nền");
        // Màu mới nằm cuối danh sách: chuyển tới trang cuối để thấy ngay
        setPage(Math.floor((data?.stats.total ?? 0) / PAGE_SIZE));
      }
      setEditing(undefined);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (item: AdminPostBackground) => {
    try {
      await adminPostBackgroundService.setActive(item.id, !item.active);
      toast.show(item.active ? `Đã tắt "${item.name}"` : `Đã bật "${item.name}"`);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    }
  };

  // Đổi chỗ với màu bên cạnh; màu ở đầu / cuối trang thì đổi với màu của trang kề rồi chuyển theo sang trang đó
  const move = async (index: number, direction: "UP" | "DOWN") => {
    try {
      await adminPostBackgroundService.move(items[index].id, direction);
      if (direction === "UP" && index === 0) setPage((p) => p - 1);
      else if (direction === "DOWN" && index === items.length - 1) setPage((p) => p + 1);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminPostBackgroundService.remove(deleting.id);
      toast.show("Đã xóa màu nền");
      setDeleting(null);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  return {
    list,
    data,
    items,
    totalPages,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    editing,
    setEditing,
    deleting,
    setDeleting,
    busy,
    save,
    toggleActive,
    move,
    confirmDelete,
  };
}
