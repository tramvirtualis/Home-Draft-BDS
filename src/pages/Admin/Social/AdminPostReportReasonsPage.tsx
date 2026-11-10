import { ArrowDown, ArrowUp, Loader2, Pencil, Plus } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import PostReportReasonFormModal from "../../../components/Admin/postReportReasons/PostReportReasonFormModal";
import Pagination from "../../../components/common/Pagination";
import { useAdminPostReportReasons } from "../../../hooks/social/useAdminPostReportReasons";

const iconButton =
  "rounded-lg p-2 text-body transition hover:bg-primary-50 hover:text-primary-700 disabled:pointer-events-none disabled:opacity-30";

// Quản lý lý do báo cáo bài viết ở trang Cộng đồng (/admin/post-report-reasons)
export default function AdminPostReportReasonsPage() {
  const {
    list, data, items, totalPages, page, setPage, pageSize,
    editing, setEditing, busy, save, toggleActive, move,
  } = useAdminPostReportReasons();

  return (
    <>
      <AdminPageHeader
        breadcrumb={[{ label: "Tổng quan", to: "/admin/dashboard" }, { label: "Cộng đồng" }, { label: "Lý do báo cáo" }]}
        title="Lý do báo cáo"
        desc="Các lý do người dùng chọn khi báo cáo bài viết vi phạm. Thứ tự ở đây là thứ tự hiện trong hộp thoại báo cáo."
        action={
          <button
            onClick={() => setEditing(null)}
            className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 active:scale-95"
          >
            <Plus size={18} /> Thêm lý do
          </button>
        }
      />

      <div className="-mt-16 px-4 pb-10 md:px-8">
        {list.waiting ? (
          <div className="relative" role="status" aria-busy="true" aria-label="Đang tải lý do báo cáo">
            <div className="mb-4 h-8 w-52 animate-pulse rounded-full bg-white shadow-sm" />
            <div className="h-96 animate-pulse rounded-2xl bg-primary-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-line">
                <Loader2 size={22} className="animate-spin text-primary-600" aria-hidden />
              </span>
            </div>
          </div>
        ) : list.status === "error" ? (
          <div role="alert" className="rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-sm">
            <p className="font-semibold text-heading">Không tải được danh sách lý do báo cáo</p>
            <button
              onClick={list.retry}
              className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95"
            >
              Thử lại
            </button>
          </div>
        ) : !data || data.stats.total === 0 ? (
          <div className="rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-sm">
            <p className="font-semibold text-heading">Chưa có lý do báo cáo nào</p>
            <p className="mt-1 text-sm text-body">Thêm lý do để người dùng báo cáo bài viết vi phạm.</p>
          </div>
        ) : (
          <>
            <p className="mb-4 inline-block rounded-full bg-white px-4 py-1.5 text-sm text-body shadow-sm">
              Đang hiện <strong className="text-heading">{data.stats.active}</strong> / {data.stats.total} lý do
            </p>
            <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-line bg-primary-50/50 text-xs font-semibold uppercase tracking-wide text-body">
                  <tr>
                    <th className="w-16 px-5 py-3">#</th>
                    <th className="px-5 py-3">Lý do</th>
                    <th className="px-5 py-3">Bắt ghi chú</th>
                    <th className="px-5 py-3">Đã dùng</th>
                    <th className="px-5 py-3">Hiện</th>
                    <th className="w-40 px-5 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map((item, index) => (
                    <tr key={item.id} className={item.active ? "" : "bg-primary-50/30 text-body"}>
                      <td className="px-5 py-4 text-body">{page * pageSize + index + 1}</td>
                      <td className="px-5 py-4">
                        <p className={`font-semibold ${item.active ? "text-heading" : "text-body"}`}>
                          {item.name}
                          {!item.active && (
                            <span className="ml-2 rounded-full bg-muted/15 px-2 py-0.5 text-xs font-medium text-body">Đang ẩn</span>
                          )}
                        </p>
                        {item.description && <p className="mt-0.5 text-xs text-body">{item.description}</p>}
                      </td>
                      <td className="px-5 py-4">
                        {item.requiresNote ? (
                          <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">Có</span>
                        ) : (
                          <span className="text-xs text-muted">Không</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-body">{item.usageCount} báo cáo</td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={item.active}
                          aria-label={`${item.active ? "Ẩn" : "Hiện"} lý do ${item.name}`}
                          onClick={() => void toggleActive(item)}
                          className={`relative h-6 w-11 shrink-0 rounded-full transition ${item.active ? "bg-success" : "bg-gray-300"}`}
                        >
                          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${item.active ? "left-[22px]" : "left-0.5"}`} />
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => void move(index, "UP")}
                            disabled={page === 0 && index === 0}
                            aria-label={`Đưa ${item.name} lên trên`}
                            title="Đưa lên trên"
                            className={iconButton}
                          >
                            <ArrowUp size={18} />
                          </button>
                          <button
                            onClick={() => void move(index, "DOWN")}
                            disabled={page === totalPages - 1 && index === items.length - 1}
                            aria-label={`Đưa ${item.name} xuống dưới`}
                            title="Đưa xuống dưới"
                            className={iconButton}
                          >
                            <ArrowDown size={18} />
                          </button>
                          <button onClick={() => setEditing(item)} aria-label={`Sửa ${item.name}`} title="Sửa" className={iconButton}>
                            <Pencil size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-8">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      {editing !== undefined && (
        <PostReportReasonFormModal item={editing} submitting={busy} onSubmit={(input) => void save(input)} onClose={() => setEditing(undefined)} />
      )}
    </>
  );
}
