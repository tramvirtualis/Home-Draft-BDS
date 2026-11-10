import AdminModal from "../AdminModal";
import { useRagChunks } from "../../../hooks/rag/useRagChunks";
import type { RagSourceKind } from "../../../types/rag/rag.types";
import { SectionBadge } from "./ragLabels";

type Props = { kind: RagSourceKind; id: number; title: string; onClose: () => void };

// Xem các đoạn text AI đã đọc được từ 1 tài liệu / dự án: đúng thứ AI dùng để trả lời
export default function RagChunksModal({ kind, id, title, onClose }: Props) {
  const load = useRagChunks(kind, id);

  return (
    <AdminModal title={`Nội dung AI đã đọc: ${title}`} onClose={onClose}>
      <div className="space-y-3 px-6 py-5">
        {load.status === "loading" ? (
          <div className="animate-pulse space-y-3" aria-busy="true" aria-label="Đang tải nội dung">
            {[0, 1, 2].map((n) => <div key={n} className="h-24 rounded-xl bg-primary-50" />)}
          </div>
        ) : load.status === "error" ? (
          <p role="alert" className="py-8 text-center text-sm text-danger">Không tải được nội dung đã index.</p>
        ) : load.chunks.length === 0 ? (
          <p className="py-8 text-center text-sm text-body">
            Chưa có đoạn nào. Nguồn này chưa được index, hoặc không trích được chữ (PDF scan, file rỗng...).
          </p>
        ) : (
          <>
            <p className="text-xs text-body">
              {load.chunks.length} đoạn · model <span className="font-mono">{load.chunks[0].embeddingModel}</span>
            </p>
            {/* Số đoạn theo từng phần, theo thứ tự xuất hiện */}
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(
                load.chunks.reduce<Record<string, number>>((acc, c) => {
                  if (c.section) acc[c.section] = (acc[c.section] ?? 0) + 1;
                  return acc;
                }, {}),
              ).map(([section, count]) => <SectionBadge key={section} section={section} count={count} />)}
            </div>
            {load.chunks.map((c) => {
              const heading = typeof c.metadata.heading === "string" ? c.metadata.heading : null;
              const page = typeof c.metadata.page === "number" ? c.metadata.page : null;
              return (
                <article key={c.id} className="rounded-xl border border-line p-3">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-primary-50 px-2 py-0.5 font-semibold text-primary-700">#{c.chunkIndex}</span>
                    {c.section && <SectionBadge section={c.section} />}
                    {page !== null && <span className="text-body">Trang {page}</span>}
                    {heading && <span className="truncate font-medium text-heading">{heading}</span>}
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-heading">{c.content}</p>
                </article>
              );
            })}
          </>
        )}
      </div>
    </AdminModal>
  );
}
