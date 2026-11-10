import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../components/common/toastContext";
import useDelayedLoad from "../../components/common/useDelayedLoad";
import { getErrorMessage } from "../../api";
import { adminPostReportReasonService, type AdminPostReportReasonStats } from "../../services/social/postReportService";
import type { PageResponse } from "../../types/common.types";
import type { AdminPostReportReason, PostReportReasonInput } from "../../types/social/social.types";
import { clearPostReportReasonsCache } from "./usePostReportReasons";

type Data = { page: PageResponse<AdminPostReportReason>; stats: AdminPostReportReasonStats };
// undefined = đóng form, null = thêm mới
type Editing = AdminPostReportReason | null | undefined;

const PAGE_SIZE = 10;

// Trang quản lý lý do báo cáo: phân trang, thêm / sửa, ẩn hiện, đổi thứ tự
export function useAdminPostReportReasons() {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Editing>(undefined);
  const [busy, setBusy] = useState(false);

  // Lần đầu tải ngay; đổi trang / tải lại thì hiện skeleton, chờ 1s rồi mới gọi API (giống trang Màu nền bài viết)
  const list = useDelayedLoad<Data>(String(page), async () => {
    const [pageData, stats] = await Promise.all([
      adminPostReportReasonService.list(page, PAGE_SIZE),
      adminPostReportReasonService.stats(),
    ]);
    return { page: pageData, stats };
  });

  const data = list.data;
  const items = data?.page.content ?? [];
  const totalPages = data?.page.totalPages ?? 1;

  // Trang hiện tại trống thì lùi về trang trước
  useEffect(() => {
    if (!list.waiting && data && data.page.content.length === 0 && page > 0) setPage(page - 1);
  }, [list.waiting, data, page]);

  // Sau mỗi thay đổi: tải lại trang + thống kê, xóa cache để hộp thoại báo cáo lấy danh sách mới
  const { reload } = list;
  const refresh = useCallback(() => {
    clearPostReportReasonsCache();
    reload();
  }, [reload]);

  const save = async (input: PostReportReasonInput) => {
    setBusy(true);
    try {
      if (editing) {
        await adminPostReportReasonService.updateReason(editing.id, input);
        toast.show("Đã cập nhật lý do báo cáo");
      } else {
        await adminPostReportReasonService.createReason(input);
        toast.show("Đã thêm lý do báo cáo");
        // Lý do mới nằm cuối danh sách: chuyển tới trang cuối để thấy ngay
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

  const toggleActive = async (item: AdminPostReportReason) => {
    try {
      await adminPostReportReasonService.setActive(item.id, !item.active);
      toast.show(item.active ? `Đã ẩn "${item.name}"` : `Đã hiện "${item.name}"`);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    }
  };

  // Đổi chỗ với lý do bên cạnh; ở đầu / cuối trang thì đổi với lý do của trang kề rồi chuyển theo sang trang đó
  const move = async (index: number, direction: "UP" | "DOWN") => {
    try {
      await adminPostReportReasonService.move(items[index].id, direction);
      if (direction === "UP" && index === 0) setPage((p) => p - 1);
      else if (direction === "DOWN" && index === items.length - 1) setPage((p) => p + 1);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
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
    busy,
    save,
    toggleActive,
    move,
  };
}
