import { useState, type FormEvent } from "react";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { postReportService } from "../../services/social/postReportService";
import useFormDraft from "../useFormDraft";
import { usePostReportReasons } from "./usePostReportReasons";

// Hộp thoại báo cáo bài viết: chọn 1 lý do, ghi chú thêm nếu cần rồi gửi
export function useReportPostForm(postId: number, onClose: () => void) {
  const toast = useToast();
  const reasons = usePostReportReasons();
  const [reasonId, setReasonId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const draft = useFormDraft("report-post", postId, { reasonId, note }, (d) => {
    setReasonId(d.reasonId);
    setNote(d.note);
  });

  const list = reasons.status === "ready" ? reasons.reasons : [];
  const selected = list.find((r) => r.id === reasonId);

  const selectReason = (id: number) => {
    setReasonId(id);
    setError("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return setError("Vui lòng chọn lý do báo cáo");
    if (selected.requiresNote && !note.trim()) return setError("Vui lòng mô tả thêm vấn đề của bài viết");
    setError("");
    setSending(true);
    try {
      await postReportService.report(postId, selected.id, note);
      draft.clear();
      toast.show("Đã gửi báo cáo, cảm ơn bạn đã góp ý");
      onClose();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
      setSending(false);
    }
  };

  return { reasons, list, reasonId, selected, selectReason, note, setNote, error, sending, draft, submit };
}
