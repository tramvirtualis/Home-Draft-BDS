import { useRef } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import useFocusTrap from "../../common/useFocusTrap";
import DraftNotice from "../../common/DraftNotice";
import { useReportPostForm } from "../../../hooks/social/useReportPostForm";

type Props = {
  postId: number;
  onClose: () => void;
};

const NOTE_MAX = 1000;

// Hộp thoại báo cáo bài viết: chọn 1 lý do (admin quản lý danh sách), ghi chú thêm nếu cần
export default function ReportPostModal({ postId, onClose }: Props) {
  const root = useRef<HTMLFormElement>(null);
  useFocusTrap(root, true, onClose);
  const { reasons, list, reasonId, selected, selectReason, note, setNote, error, sending, draft, submit } = useReportPostForm(postId, onClose);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-footer/40 px-4 backdrop-blur-sm">
      <form
        ref={root}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-post-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => void submit(e)}
        className="animate-page-in flex max-h-[92vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <h2 id="report-post-title" className="text-lg font-bold text-footer">Báo cáo bài viết</h2>
            <p className="mt-1 text-sm text-body">Bài viết này có vấn đề gì? Quản trị viên sẽ xem xét báo cáo của bạn.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-full p-1.5 text-muted transition hover:bg-page hover:text-heading">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-5">
          <DraftNotice show={draft.restored} onDiscard={draft.discard} />
          {reasons.status === "loading" ? (
            <p className="flex items-center justify-center gap-2 py-8 text-sm text-body" role="status">
              <Loader2 size={18} className="animate-spin text-primary-600" aria-hidden /> Đang tải lý do...
            </p>
          ) : reasons.status === "error" ? (
            <p role="alert" className="py-8 text-center text-sm text-danger">Không tải được danh sách lý do, vui lòng thử lại sau.</p>
          ) : list.length === 0 ? (
            <p className="py-8 text-center text-sm text-body">Hiện chưa có lý do báo cáo nào.</p>
          ) : (
            <div role="radiogroup" aria-label="Lý do báo cáo" className="space-y-2">
              {list.map((r) => {
                const on = r.id === reasonId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => selectReason(r.id)}
                    disabled={sending}
                    className={`flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
                      on ? "border-primary-600 bg-primary-50" : "border-line hover:bg-primary-50/50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-primary-600" : "border-muted"}`}
                      aria-hidden
                    >
                      {on && <span className="h-2 w-2 rounded-full bg-primary-600" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-heading">{r.name}</span>
                      {r.description && <span className="mt-0.5 block text-xs text-body">{r.description}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {selected && (
            <label className="block">
              <span className="text-sm font-semibold text-footer">
                Mô tả thêm{" "}
                {selected.requiresNote ? <span className="text-danger">*</span> : <span className="text-xs font-normal text-muted">(Không bắt buộc)</span>}
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={NOTE_MAX}
                rows={3}
                disabled={sending}
                placeholder="Cho chúng tôi biết thêm chi tiết..."
                className="mt-1.5 w-full resize-none rounded-xl border border-line px-4 py-3 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
              />
              <span className="block text-right text-xs text-muted">{note.length}/{NOTE_MAX}</span>
            </label>
          )}

          {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50">
            Hủy
          </button>
          <button
            type="submit"
            disabled={sending || list.length === 0}
            className="rounded-lg bg-danger px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-60"
          >
            {sending ? "Đang gửi..." : "Gửi báo cáo"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
