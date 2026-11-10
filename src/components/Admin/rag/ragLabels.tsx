import type { RagDocumentStatus, RagProjectStatus } from "../../../types/rag/rag.types";

type Status = RagDocumentStatus | RagProjectStatus;

export const STATUS_LABEL: Record<Status, { label: string; dot: string; badge: string }> = {
  INDEXED: { label: "Đã index", dot: "bg-success", badge: "bg-green-50 text-green-700 ring-green-200" },
  PENDING: { label: "Chờ index", dot: "bg-warning", badge: "bg-amber-50 text-amber-700 ring-amber-200" },
  NOT_INDEXED: { label: "Chưa index", dot: "bg-warning", badge: "bg-amber-50 text-amber-700 ring-amber-200" },
  FAILED: { label: "Lỗi", dot: "bg-danger", badge: "bg-red-50 text-red-700 ring-red-200" },
  SKIPPED: { label: "Bỏ qua", dot: "bg-muted", badge: "bg-gray-50 text-gray-600 ring-gray-200" },
};

// Tên phần của chunk (cột section bên RAG)
export const SECTION_LABEL: Record<string, string> = {
  overview: "Tổng quan",
  content: "Nội dung",
  file: "File",
  location: "Vị trí",
  zone: "Phân khu",
  amenity: "Tiện ích",
  progress: "Tiến độ",
  faq: "Hỏi đáp",
  bank: "Ngân hàng liên kết",
};

// Màu nhãn từng phần, để nhìn danh sách chunk là phân biệt được loại
const SECTION_STYLE: Record<string, string> = {
  overview: "bg-sky-50 text-sky-700 ring-sky-200",
  content: "bg-gray-100 text-gray-700 ring-gray-200",
  file: "bg-gray-100 text-gray-700 ring-gray-200",
  location: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  zone: "bg-violet-50 text-violet-700 ring-violet-200",
  amenity: "bg-teal-50 text-teal-700 ring-teal-200",
  progress: "bg-amber-50 text-amber-700 ring-amber-200",
  faq: "bg-rose-50 text-rose-700 ring-rose-200",
  bank: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

export function SectionBadge({ section, count }: { section: string; count?: number }) {
  const style = SECTION_STYLE[section] ?? "bg-gray-100 text-gray-700 ring-gray-200";
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${style}`}>
      {SECTION_LABEL[section] ?? section}
      {count !== undefined && <span className="font-semibold">{count}</span>}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_LABEL[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /> {s.label}
    </span>
  );
}
