import { useEffect, useState } from "react";
import { adminPostReportService } from "../../services/social/postReportService";

// Bắn sự kiện này sau khi xử lý báo cáo để số trên sidebar cập nhật ngay
export const POST_REPORTS_CHANGED = "post-reports:changed";
export const notifyPostReportsChanged = () => window.dispatchEvent(new Event(POST_REPORTS_CHANGED));

// Số bài đang chờ xử lý báo cáo, cho số đếm ở sidebar admin; enabled = false (không có quyền xem) thì không gọi API
export function usePendingReportCount(enabled: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const load = () =>
      adminPostReportService
        .stats()
        .then((s) => !cancelled && setCount(s.pending))
        .catch(() => undefined);
    // Chỉ gọi 1 lần khi vào trang admin; sau đó chỉ tải lại khi admin vừa xử lý báo cáo
    load();
    window.addEventListener(POST_REPORTS_CHANGED, load);
    return () => {
      cancelled = true;
      window.removeEventListener(POST_REPORTS_CHANGED, load);
    };
  }, [enabled]);

  return enabled ? count : 0;
}
