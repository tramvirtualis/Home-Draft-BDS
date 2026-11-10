import { useEffect, useState } from "react";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminPostReportService } from "../../services/social/postReportService";
import type { AdminReportedPostDetail } from "../../types/social/social.types";
import useFormDraft from "../useFormDraft";
import { notifyPostReportsChanged } from "./usePendingReportCount";

type Load = { status: "loading" } | { status: "error" } | { status: "ready"; data: AdminReportedPostDetail };

// Hộp thoại duyệt báo cáo: tải bài bị báo cáo + từng lượt báo cáo, rồi ẩn bài hoặc bỏ qua
export function useReportedPostReview(postId: number, onResolved: () => void, onClose: () => void) {
  const toast = useToast();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"HIDE" | "DISMISS" | null>(null);
  const draft = useFormDraft("report-review", postId, { note }, (d) => setNote(d.note));

  useEffect(() => {
    let cancelled = false;
    adminPostReportService
      .detail(postId)
      .then((data) => !cancelled && setLoad({ status: "ready", data }))
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const resolve = async (action: "HIDE" | "DISMISS") => {
    setBusy(action);
    try {
      await adminPostReportService.resolve(postId, action, note);
      draft.clear();
      toast.show(action === "HIDE" ? "Đã ẩn bài viết vi phạm" : "Đã bỏ qua báo cáo");
      notifyPostReportsChanged();
      onResolved();
      onClose();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
      setBusy(null);
    }
  };

  const reports = load.status === "ready" ? load.data.reports : [];
  const pendingCount = reports.filter((r) => r.status === "PENDING").length;

  return { load, note, setNote, busy, draft, resolve, reports, pendingCount };
}
