import { History } from "lucide-react";

// Dòng báo trong form: đang hiện nội dung nháp người dùng gõ lần trước, kèm nút xóa nháp
export default function DraftNotice({ show, onDiscard }: { show: boolean; onDiscard: () => void }) {
  if (!show) return null;
  return (
    <div role="status" className="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50/60 px-3.5 py-2.5 text-xs text-body">
      <History size={15} className="shrink-0 text-primary-600" aria-hidden />
      <span className="flex-1">Đã khôi phục nội dung bạn nhập dở lần trước.</span>
      <button type="button" onClick={onDiscard} className="shrink-0 font-semibold text-primary-700 underline-offset-2 hover:underline">
        Xóa nháp
      </button>
    </div>
  );
}
