import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { PostScopeFilter } from "../../components/Admin/posts/PostScopeTabs";
import { useToast } from "../../components/common/toastContext";
import useDelayedLoad from "../../components/common/useDelayedLoad";
import { getErrorMessage } from "../../api";
import { adminPostService } from "../../services/social/adminPostService";
import type { AdminPost, AdminPostStats } from "../../types/social/social.types";

export type AdminPostStatusFilter = "all" | "active" | "hidden";

const PAGE_SIZE = 10;
const EMPTY_STATS: AdminPostStats = { all: 0, publicPosts: 0, privatePosts: 0, hidden: 0 };

const activeParam = (s: AdminPostStatusFilter) => (s === "all" ? null : s === "active");

// Trang quản lý bài đăng: tìm kiếm, lọc phạm vi / trạng thái / khoảng ngày và phân trang ở server, ẩn hiện bài
export function useAdminPosts() {
  const toast = useToast();
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [scope, setScope] = useState<PostScopeFilter>("all");
  const [status, setStatus] = useState<AdminPostStatusFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [hiding, setHiding] = useState<AdminPost | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadStats = useCallback(() => adminPostService.stats().then(setStats).catch(() => undefined), []);
  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  // Chờ 1 giây (có skeleton) rồi mới gọi API khi đổi trang / bộ lọc; lần vào đầu tiên gọi ngay
  const list = useDelayedLoad(JSON.stringify([keyword, scope, status, from, to, page]), () =>
    adminPostService.search({
      keyword,
      scope: scope === "all" ? null : scope,
      active: activeParam(status),
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
    setScope("all");
    setStatus("all");
    setFrom("");
    setTo("");
    setPage(0);
  };

  const toggleActive = async (p: AdminPost) => {
    setBusyId(p.id);
    try {
      await adminPostService.setActive(p.id, !p.active);
      toast.show(p.active ? "Đã ẩn bài viết" : "Đã hiển thị bài viết");
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  // Ẩn bài là việc người dùng sẽ thấy ngay nên hỏi xác nhận; hiện lại thì làm luôn
  const requestToggle = (p: AdminPost) => (p.active ? setHiding(p) : void toggleActive(p));

  const confirmHide = async () => {
    if (!hiding) return;
    await toggleActive(hiding);
    setHiding(null);
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
    scope,
    changeScope: withFirstPage(setScope),
    status,
    changeStatus: withFirstPage(setStatus),
    from,
    changeFrom: withFirstPage(setFrom),
    to,
    changeTo: withFirstPage(setTo),
    badRange: from !== "" && to !== "" && from > to,
    hasFilter: input.trim() !== "" || scope !== "all" || status !== "all" || from !== "" || to !== "",
    resetFilters,
    stats,
    busyId,
    hiding,
    setHiding,
    requestToggle,
    confirmHide,
  };
}
