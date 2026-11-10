import { ArrowLeft, ArrowRight, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import PostBackgroundFormModal from "../../../components/Admin/postBackgrounds/PostBackgroundFormModal";
import Pagination from "../../../components/common/Pagination";
import { useAdminPostBackgrounds } from "../../../hooks/social/useAdminPostBackgrounds";

const iconButton =
  "rounded-lg p-2 text-body transition hover:bg-primary-50 hover:text-primary-700 disabled:pointer-events-none disabled:opacity-30";

// Quản lý màu nền cho bài viết chỉ có chữ ở trang Cộng đồng (/admin/post-backgrounds)
export default function AdminPostBackgroundsPage() {
  const {
    list, data, items, totalPages, page, setPage, pageSize,
    editing, setEditing, deleting, setDeleting, busy,
    save, toggleActive, move, confirmDelete,
  } = useAdminPostBackgrounds();

  return (
    <>
      <AdminPageHeader
        breadcrumb={[{ label: "Tổng quan", to: "/admin/dashboard" }, { label: "Cộng đồng" }, { label: "Màu nền bài viết" }]}
        title="Màu nền bài viết"
        desc="Các màu nền người dùng chọn khi đăng bài chỉ có chữ. Thứ tự ở đây là thứ tự hiện trong ô đăng bài."
        action={
          <button
            onClick={() => setEditing(null)}
            className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 active:scale-95"
          >
            <Plus size={18} /> Thêm màu nền
          </button>
        }
      />

      <div className="-mt-16 px-4 pb-10 md:px-8">
        {list.waiting ? (
          // Khung thẻ nhấp nháy + vòng quay ở giữa, giống TableSkeleton của các trang dạng bảng
          <div className="relative" role="status" aria-busy="true" aria-label="Đang tải màu nền">
            <div className="mb-4 h-8 w-52 animate-pulse rounded-full bg-white shadow-sm" />
            <div className="grid animate-pulse gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: pageSize }, (_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-primary-50" />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-line">
                <Loader2 size={22} className="animate-spin text-primary-600" aria-hidden />
              </span>
            </div>
          </div>
        ) : list.status === "error" ? (
          <div role="alert" className="rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-sm">
            <p className="font-semibold text-heading">Không tải được danh sách màu nền</p>
            <button
              onClick={list.retry}
              className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95"
            >
              Thử lại
            </button>
          </div>
        ) : !data || data.stats.total === 0 ? (
          <div className="rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-sm">
            <p className="font-semibold text-heading">Chưa có màu nền nào</p>
            <p className="mt-1 text-sm text-body">Thêm màu nền để người dùng trang trí bài viết chỉ có chữ.</p>
          </div>
        ) : (
          <>
            <p className="mb-4 inline-block rounded-full bg-white px-4 py-1.5 text-sm text-body shadow-sm">
              Đang bật <strong className="text-heading">{data.stats.active}</strong> / {data.stats.total} màu nền
            </p>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className={`overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition ${item.active ? "" : "opacity-70"}`}
                >
                  <div
                    className="relative flex h-36 items-center justify-center px-4 text-center text-xl font-bold"
                    style={{ background: item.value, color: item.textColor }}
                  >
                    Aa
                    {!item.active && (
                      <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-semibold text-white">Đang tắt</span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-heading">{item.name}</p>
                        <p className="text-xs text-body">
                          {item.usageCount > 0 ? `${item.usageCount} bài viết đang dùng` : "Chưa có bài viết nào dùng"}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.active}
                        aria-label={`${item.active ? "Tắt" : "Bật"} màu nền ${item.name}`}
                        onClick={() => void toggleActive(item)}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition ${item.active ? "bg-success" : "bg-gray-300"}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${item.active ? "left-[22px]" : "left-0.5"}`} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                      <div className="flex items-center">
                        <button
                          onClick={() => void move(index, "UP")}
                          disabled={page === 0 && index === 0}
                          aria-label={`Đưa ${item.name} lên trước`}
                          title="Đưa lên trước"
                          className={iconButton}
                        >
                          <ArrowLeft size={18} />
                        </button>
                        <button
                          onClick={() => void move(index, "DOWN")}
                          disabled={page === totalPages - 1 && index === items.length - 1}
                          aria-label={`Đưa ${item.name} ra sau`}
                          title="Đưa ra sau"
                          className={iconButton}
                        >
                          <ArrowRight size={18} />
                        </button>
                      </div>
                      <div className="flex items-center">
                        <button onClick={() => setEditing(item)} aria-label={`Sửa ${item.name}`} title="Sửa" className={iconButton}>
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setDeleting(item)}
                          disabled={item.usageCount > 0}
                          aria-label={`Xóa ${item.name}`}
                          title={item.usageCount > 0 ? "Đã có bài viết dùng, hãy tắt thay vì xóa" : "Xóa"}
                          className={`${iconButton} hover:text-danger`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      {editing !== undefined && (
        <PostBackgroundFormModal item={editing} submitting={busy} onSubmit={(input) => void save(input)} onClose={() => setEditing(undefined)} />
      )}
      {deleting && (
        <ConfirmDialog
          title="Xóa màu nền?"
          message={`Màu nền "${deleting.name}" sẽ bị xóa vĩnh viễn và không còn hiện trong ô đăng bài.`}
          busy={busy}
          onConfirm={() => void confirmDelete()}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
