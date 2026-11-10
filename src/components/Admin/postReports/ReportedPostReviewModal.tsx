import { EyeOff, Loader2, ShieldCheck } from "lucide-react";
import AdminModal from "../AdminModal";
import DraftNotice from "../../common/DraftNotice";
import { PostDetailBody } from "../posts/PostDetailModal";
import Avatar from "../../common/Avatar";
import { useReportedPostReview } from "../../../hooks/social/useReportedPostReview";
import { formatDate, formatTime } from "../../../utils/formatDate";
import type { PostReportStatus } from "../../../types/social/social.types";

type Props = {
  postId: number;
  onClose: () => void;
  // Xử lý xong: trang danh sách tải lại
  onResolved: () => void;
};

export const REPORT_STATUS_LABEL: Record<PostReportStatus, string> = {
  PENDING: "Chờ xử lý",
  RESOLVED: "Đã ẩn bài",
  REJECTED: "Đã bỏ qua",
};

export const REPORT_STATUS_STYLE: Record<PostReportStatus, string> = {
  PENDING: "bg-warning/10 text-warning",
  RESOLVED: "bg-danger/10 text-danger",
  REJECTED: "bg-success/10 text-success",
};

// Xem toàn bộ bài bị báo cáo + từng lượt báo cáo, rồi quyết định ẩn bài hay bỏ qua
export default function ReportedPostReviewModal({ postId, onClose, onResolved }: Props) {
  const { load, note, setNote, busy, draft, resolve, reports, pendingCount } = useReportedPostReview(postId, onResolved, onClose);

  return (
    <AdminModal persistent title="Duyệt báo cáo bài viết" onClose={onClose}>
      {load.status === "loading" ? (
        <p className="flex items-center justify-center gap-2 py-16 text-sm text-body" role="status">
          <Loader2 size={18} className="animate-spin text-primary-600" aria-hidden /> Đang tải...
        </p>
      ) : load.status === "error" ? (
        <p role="alert" className="py-16 text-center text-sm text-danger">Không tải được bài viết bị báo cáo.</p>
      ) : (
        <>
          <PostDetailBody post={load.data.post} />

          <section className="border-t border-line px-6 py-5">
            <h3 className="text-sm font-bold text-footer">
              Các lượt báo cáo <span className="font-normal text-body">({reports.length})</span>
            </h3>
            <ul className="mt-3 space-y-3">
              {reports.map((r) => (
                <li key={r.id} className="rounded-xl border border-line p-3">
                  <div className="flex items-start gap-3">
                    <Avatar src={r.reporter.avatarUrl} fullName={r.reporter.fullName ?? "Người dùng"} className="h-8 w-8" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-semibold text-heading">{r.reporter.fullName ?? "Người dùng"}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${REPORT_STATUS_STYLE[r.status]}`}>
                          {REPORT_STATUS_LABEL[r.status]}
                        </span>
                      </div>
                      <p className="text-xs text-muted">{formatDate(r.createdAt)} · {formatTime(r.createdAt)}</p>
                      <p className="mt-1.5 text-sm font-medium text-heading">{r.reason ?? "Không rõ lý do"}</p>
                      {r.description && <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-body">{r.description}</p>}
                      {r.handledAt && (
                        <p className="mt-1.5 text-xs text-muted">
                          Xử lý bởi {r.handledBy?.fullName ?? "quản trị viên"} lúc {formatDate(r.handledAt)} · {formatTime(r.handledAt)}
                          {r.handlerNote && <> — “{r.handlerNote}”</>}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {pendingCount > 0 ? (
            <section className="space-y-3 border-t border-line bg-primary-50/40 px-6 py-5">
              <p className="text-sm text-body">
                Quyết định áp dụng cho <strong className="text-heading">{pendingCount}</strong> báo cáo đang chờ xử lý của bài này.
              </p>
              <DraftNotice show={draft.restored} onDiscard={draft.discard} />
              <label className="block">
                <span className="text-sm font-semibold text-footer">
                  Ghi chú xử lý <span className="text-xs font-normal text-muted">(Không bắt buộc)</span>
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                  rows={2}
                  disabled={busy !== null}
                  placeholder="Lý do quyết định, để tra cứu sau này"
                  className="mt-1.5 w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
                />
              </label>
              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => void resolve("DISMISS")}
                  disabled={busy !== null}
                  className="flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50 disabled:opacity-60"
                >
                  <ShieldCheck size={16} /> {busy === "DISMISS" ? "Đang lưu..." : "Bỏ qua (không vi phạm)"}
                </button>
                <button
                  type="button"
                  onClick={() => void resolve("HIDE")}
                  disabled={busy !== null}
                  className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-60"
                >
                  <EyeOff size={16} /> {busy === "HIDE" ? "Đang ẩn..." : "Ẩn bài viết"}
                </button>
              </div>
              <p className="text-xs text-muted">Ẩn bài: người dùng không còn thấy bài trên bảng tin. Muốn hiện lại thì bật ở trang Quản lý bài đăng.</p>
            </section>
          ) : (
            <p className="border-t border-line px-6 py-4 text-sm text-body">Bài viết này không còn báo cáo nào chờ xử lý.</p>
          )}
        </>
      )}
    </AdminModal>
  );
}
