import { useEffect, useState } from "react";
import useDelayedLoad from "../../components/common/useDelayedLoad";
import { adminPostReportService } from "../../services/social/postReportService";
import type { PageResponse } from "../../types/common.types";
import type { AdminPostReportStats, AdminReportedPost, PostReportStatus } from "../../types/social/social.types";

type Data = { page: PageResponse<AdminReportedPost>; stats: AdminPostReportStats };

const PAGE_SIZE = 10;

// Trang duyệt báo cáo vi phạm: lọc theo trạng thái, phân trang ở server
export function useAdminPostReports() {
  const [status, setStatus] = useState<PostReportStatus>("PENDING");
  const [page, setPage] = useState(0);

  const list = useDelayedLoad<Data>(`${status}-${page}`, async () => {
    const [pageData, stats] = await Promise.all([
      adminPostReportService.list(status, page, PAGE_SIZE),
      adminPostReportService.stats(),
    ]);
    return { page: pageData, stats };
  });

  const data = list.data;
  const items = data?.page.content ?? [];

  // Xử lý xong bài cuối cùng của trang cuối thì lùi về trang trước
  useEffect(() => {
    if (!list.waiting && data && data.page.content.length === 0 && page > 0) setPage(page - 1);
  }, [list.waiting, data, page]);

  const changeTab = (next: PostReportStatus) => {
    setStatus(next);
    setPage(0);
  };

  return { list, data, items, status, page, setPage, changeTab };
}
