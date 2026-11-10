import { useEffect, useState } from "react";
import useDelayedLoad from "../../components/common/useDelayedLoad";
import { adminRagService } from "../../services/rag/adminRagService";
import type { RagDocumentRow, RagProjectRow, RagSourceKind } from "../../types/rag/rag.types";

const PAGE_SIZE = 10;

type Row = { id: number; title: string; sub: string; published: boolean; row: RagDocumentRow | RagProjectRow };

// Tab Nguồn dữ liệu: lọc theo loại / trạng thái, tìm theo tên, phân trang ở server.
// reloadToken tăng lên sau mỗi lần index lại để bảng tải lại
export function useRagSources(reloadToken: number) {
  const [kind, setKind] = useState<RagSourceKind>("documents");
  const [status, setStatus] = useState("");
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);

  // Chờ người dùng ngừng gõ rồi mới tìm
  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(input.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [input]);

  const list = useDelayedLoad(JSON.stringify([kind, status, keyword, page, reloadToken]), async () => {
    const params = { status, keyword, page, size: PAGE_SIZE };
    if (kind === "documents") {
      const p = await adminRagService.documents(params);
      return {
        totalPages: p.totalPages,
        total: p.totalElements,
        rows: p.content.map((d): Row => ({
          id: d.id,
          title: d.title,
          sub: [d.type === "FILE" ? "File" : "Bài viết", d.category].filter(Boolean).join(" · "),
          published: d.published,
          row: d,
        })),
      };
    }
    const p = await adminRagService.projects(params);
    return {
      totalPages: p.totalPages,
      total: p.totalElements,
      rows: p.content.map((x): Row => ({ id: x.id, title: x.name, sub: x.error ?? "", published: x.published, row: x })),
    };
  });

  const changeKind = (k: RagSourceKind) => {
    setKind(k);
    setStatus("");
    setPage(0);
  };

  const changeStatus = (next: string) => {
    setStatus(next);
    setPage(0);
  };

  return { kind, changeKind, status, changeStatus, input, setInput, page, setPage, list };
}
