import { useEffect, useState } from "react";
import { adminRagService } from "../../services/rag/adminRagService";
import type { RagChunk, RagSourceKind } from "../../types/rag/rag.types";

type Load = { status: "loading" } | { status: "error" } | { status: "ready"; chunks: RagChunk[] };

// Tải các đoạn text AI đã đọc được từ 1 tài liệu / dự án
export function useRagChunks(kind: RagSourceKind, id: number) {
  const [load, setLoad] = useState<Load>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    adminRagService
      .chunks(kind, id)
      .then((chunks) => !cancelled && setLoad({ status: "ready", chunks }))
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [kind, id]);

  return load;
}
