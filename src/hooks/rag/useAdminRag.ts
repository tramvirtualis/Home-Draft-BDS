import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminRagService } from "../../services/rag/adminRagService";
import type { RagIndexResult, RagSourceKind, RagStatus } from "../../types/rag/rag.types";

type Load = { status: "loading" } | { status: "error" } | { status: "ready"; data: RagStatus };

const resultMessage = (r: RagIndexResult, title: string): [string, "success" | "error"] => {
  switch (r.status) {
    case "INDEXED": return [`Đã index "${title}": ${r.chunks} đoạn`, "success"];
    case "UNCHANGED": return [`"${title}" không có gì thay đổi`, "success"];
    case "CHANGED": return [`"${title}" vừa bị sửa trong lúc index, hệ thống sẽ tự index bản mới sau ít phút`, "success"];
    case "NOT_FOUND": return [`Không tìm thấy "${title}", có thể đã bị xóa`, "error"];
    default: return [`Index "${title}" lỗi: ${r.error ?? "không rõ nguyên nhân"}`, "error"];
  }
};

// Trang quản lý trợ lý AI: trạng thái RAG, index lại 1 nguồn hoặc toàn bộ
export function useAdminRag() {
  const toast = useToast();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reloadToken, setReloadToken] = useState(0);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [reindexingAll, setReindexingAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminRagService
      .status()
      .then((data) => !cancelled && setLoad({ status: "ready", data }))
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const refresh = useCallback(() => setReloadToken((n) => n + 1), []);

  const retry = () => {
    setLoad({ status: "loading" });
    refresh();
  };

  const reindex = async (kind: RagSourceKind, id: number, title: string) => {
    setBusyKey(`${kind}-${id}`);
    try {
      const [message, type] = resultMessage(await adminRagService.reindex(kind, id), title);
      toast.show(message, type);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setBusyKey(null);
    }
  };

  const reindexAll = async () => {
    setReindexingAll(true);
    try {
      await adminRagService.reindexAll();
      toast.show("Đã bắt đầu index toàn bộ, bấm Tải lại sau ít phút để xem kết quả");
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setReindexingAll(false);
    }
  };

  return { load, reloadToken, refresh, retry, busyKey, reindexingAll, reindex, reindexAll };
}
