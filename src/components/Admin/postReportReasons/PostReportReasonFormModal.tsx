import { useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import useFocusTrap from "../../common/useFocusTrap";
import DraftNotice from "../../common/DraftNotice";
import useFormDraft from "../../../hooks/useFormDraft";
import type { AdminPostReportReason, PostReportReasonInput } from "../../../types/social/social.types";

type Props = {
  item: AdminPostReportReason | null; // null = thêm mới
  submitting: boolean;
  onSubmit: (input: PostReportReasonInput) => void;
  onClose: () => void;
};

const field = "w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

export default function PostReportReasonFormModal({ item, submitting, onSubmit, onClose }: Props) {
  const root = useRef<HTMLFormElement>(null);
  useFocusTrap(root, true, onClose);

  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [requiresNote, setRequiresNote] = useState(item?.requiresNote ?? false);
  const [active, setActive] = useState(item?.active ?? true);
  const [error, setError] = useState("");
  const draft = useFormDraft("report-reason", item?.id, { name, description, requiresNote, active }, (d) => {
    setName(d.name);
    setDescription(d.description);
    setRequiresNote(d.requiresNote);
    setActive(d.active);
  }, { busy: submitting });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Nhập tên lý do");
    setError("");
    draft.clear();
    onSubmit({ name: name.trim(), description: description.trim(), requiresNote, active });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-footer/40 px-4 backdrop-blur-sm">
      <form
        ref={root}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-reason-form-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="animate-page-in flex max-h-[92vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-line p-6">
          <h2 id="report-reason-form-title" className="text-xl font-bold text-footer">
            {item ? "Chỉnh sửa lý do báo cáo" : "Thêm lý do báo cáo"}
          </h2>
          <p className="mt-1 text-sm text-body">Người dùng chọn lý do này khi báo cáo bài viết vi phạm ở trang Cộng đồng.</p>
        </div>

        <div className="space-y-5 overflow-y-auto p-6">
          <DraftNotice show={draft.restored} onDiscard={draft.discard} />
          <label className="block">
            <span className="text-sm font-semibold text-footer">Tên lý do <span className="text-danger">*</span></span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="Ví dụ: Lừa đảo" className={`${field} mt-1.5 h-11`} />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-footer">
              Mô tả <span className="text-xs font-normal text-muted">(Không bắt buộc)</span>
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={255}
              rows={2}
              placeholder="Giải thích ngắn hiện dưới tên lý do"
              className={`${field} mt-1.5 resize-none py-3`}
            />
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={requiresNote} onChange={(e) => setRequiresNote(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary-600" />
            <span className="text-sm text-heading">
              Bắt người báo cáo ghi thêm chi tiết
              <span className="block text-xs text-body">Nên bật cho lý do chung chung như "Khác".</span>
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-primary-600" />
            <span className="text-sm text-heading">Hiện lý do này cho người dùng chọn</span>
          </label>

          {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50">Hủy</button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60">
            {submitting ? "Đang lưu..." : item ? "Lưu thay đổi" : "Thêm lý do"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
