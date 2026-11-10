import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ReportedPostReviewModal, {
  REPORT_STATUS_LABEL,
  REPORT_STATUS_STYLE,
} from "../../../components/Admin/postReports/ReportedPostReviewModal";
import Avatar from "../../../components/common/Avatar";
import Pagination from "../../../components/common/Pagination";
import { useAdminPostReports } from "../../../hooks/social/useAdminPostReports";
import { formatDate, formatTime } from "../../../utils/formatDate";
import type { AdminPostReportStats, PostReportStatus } from "../../../types/social/social.types";

const TABS: { status: PostReportStatus; statKey: keyof AdminPostReportStats }[] = [
  { status: "PENDING", statKey: "pending" },
  { status: "RESOLVED", statKey: "resolved" },
  { status: "REJECTED", statKey: "rejected" },
];

// Bài do admin đăng có nội dung HTML: bỏ thẻ để hiện đoạn trích
const snippet = (content: string | null) =>
  content ? content.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim() : "";

// Duyệt báo cáo bài viết vi phạm (/admin/post-reports): mỗi dòng là một bài, gom mọi báo cáo của bài
export default function AdminPostReportsPage() {
  const { list, data, items, status, page, setPage, changeTab } = useAdminPostReports();
  const [reviewing, setReviewing] = useState<number | null>(null);

  return (
    <>
      <AdminPageHeader
        breadcrumb={[{ label: "Tổng quan", to: "/admin/dashboard" }, { label: "Cộng đồng" }, { label: "Báo cáo vi phạm" }]}
        title="Báo cáo vi phạm"
        desc="Bài viết bị người dùng báo cáo. Xem chi tiết rồi quyết định ẩn bài hay bỏ qua."
      />

      <div className="-mt-16 px-4 pb-10 md:px-8">
        <div role="tablist" aria-label="Trạng thái báo cáo" className="mb-4 inline-flex flex-wrap gap-1 rounded-full bg-white p-1 shadow-sm">
          {TABS.map((t) => {
            const on = t.status === status;
            const count = data?.stats[t.statKey];
            return (
              <button
                key={t.status}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => changeTab(t.status)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${on ? "bg-primary-600 text-white" : "text-body hover:text-heading"}`}
              >
                {REPORT_STATUS_LABEL[t.status]}
                {count !== undefined && (
                  <span className={`ml-1.5 rounded-full px-1.5 text-xs ${on ? "bg-white/20" : "bg-primary-50"}`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {list.waiting ? (
          <div className="relative" role="status" aria-busy="true" aria-label="Đang tải báo cáo">
            <div className="h-96 animate-pulse rounded-2xl bg-primary-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-line">
                <Loader2 size={22} className="animate-spin text-primary-600" aria-hidden />
              </span>
            </div>
          </div>
        ) : list.status === "error" ? (
          <div role="alert" className="rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-sm">
            <p className="font-semibold text-heading">Không tải được danh sách báo cáo</p>
            <button
              onClick={list.retry}
              className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95"
            >
              Thử lại
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-sm">
            <p className="font-semibold text-heading">
              {status === "PENDING" ? "Không có báo cáo nào chờ xử lý" : `Chưa có bài nào ${REPORT_STATUS_LABEL[status].toLowerCase()}`}
            </p>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {items.map((item, index) => {
                const post = item.post;
                const text = snippet(post?.content ?? null);
                const thumb = post?.imageUrls[0];
                return (
                  <li key={post?.id ?? index} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={post?.author?.avatarUrl ?? null} fullName={post?.author?.fullName ?? "Người dùng"} className="h-8 w-8" />
                          <span className="truncate text-sm font-semibold text-heading">{post?.author?.fullName ?? "Người dùng"}</span>
                          {post && !post.active && (
                            <span className="rounded-full bg-line px-2 py-0.5 text-xs font-semibold text-body">Bài đang ẩn</span>
                          )}
                        </div>
                        <div className="mt-2 flex gap-3">
                          {thumb && <img src={thumb} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-lg object-cover" />}
                          <p className="line-clamp-3 text-sm text-body">
                            {text || (post?.videoUrl ? "Bài viết có video" : <span className="italic text-muted">Không có nội dung chữ</span>)}
                          </p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {item.reasons.slice(0, 3).map((r) => (
                            <span key={r.name} className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-heading">
                              {r.name} <span className="text-body">×{r.count}</span>
                            </span>
                          ))}
                          {item.reasons.length > 3 && (
                            <span className="rounded-full px-2 py-1 text-xs text-body">+{item.reasons.length - 3} lý do khác</span>
                          )}
                        </div>
                        {item.handledAt && (
                          <p className="mt-2 text-xs text-muted">
                            Xử lý bởi {item.handledBy?.fullName ?? "quản trị viên"} lúc {formatDate(item.handledAt)} · {formatTime(item.handledAt)}
                            {item.handlerNote && <> — “{item.handlerNote}”</>}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                        <span className="flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-sm font-bold text-danger">
                          <Flag size={14} /> {item.reportCount} báo cáo
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${REPORT_STATUS_STYLE[item.status]}`}>
                          {REPORT_STATUS_LABEL[item.status]}
                        </span>
                        {item.lastReportedAt && (
                          <span className="text-xs text-muted">Gần nhất {formatDate(item.lastReportedAt)}</span>
                        )}
                        {post && (
                          <button
                            onClick={() => setReviewing(post.id)}
                            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95"
                          >
                            {item.status === "PENDING" ? "Xem & xử lý" : "Xem chi tiết"}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8">
              <Pagination page={page} totalPages={data?.page.totalPages ?? 1} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      {reviewing !== null && (
        <ReportedPostReviewModal postId={reviewing} onClose={() => setReviewing(null)} onResolved={list.reload} />
      )}
    </>
  );
}
