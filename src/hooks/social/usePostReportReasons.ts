import { useEffect, useState } from "react";
import { postReportReasonService } from "../../services/social/postReportService";
import type { PostReportReason } from "../../types/social/social.types";

// Danh sách lý do ít khi đổi: tải 1 lần rồi dùng lại cho cả phiên; lỗi thì lần mở sau tải lại
let cache: Promise<PostReportReason[]> | null = null;

// Admin vừa thêm / sửa / ẩn lý do: lần mở hộp thoại báo cáo sau sẽ tải lại danh sách
export const clearPostReportReasonsCache = () => {
  cache = null;
};

type State = { status: "loading" } | { status: "error" } | { status: "ready"; reasons: PostReportReason[] };

export function usePostReportReasons() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    cache ??= postReportReasonService.list();
    cache
      .then((reasons) => !cancelled && setState({ status: "ready", reasons }))
      .catch(() => {
        cache = null;
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
