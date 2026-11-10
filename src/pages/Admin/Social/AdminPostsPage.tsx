import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, LayoutList, Plus, RotateCcw, Search } from "lucide-react";
import Pagination from "../../../components/common/Pagination";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import FilterSelect from "../../../components/Admin/FilterSelect";
import PostDetailModal from "../../../components/Admin/posts/PostDetailModal";
import PostScopeTabs from "../../../components/Admin/posts/PostScopeTabs";
import PostsTable from "../../../components/Admin/posts/PostsTable";
import TableSkeleton from "../../../components/common/TableSkeleton";
import { useAdminPosts, type AdminPostStatusFilter } from "../../../hooks/social/useAdminPosts";
import type { AdminPost } from "../../../types/social/social.types";

const field =
  "h-11 rounded-xl border border-line bg-white text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

// Quản lý bài đăng cộng đồng: tìm kiếm, lọc phạm vi / trạng thái / khoảng ngày và phân trang ở server theo GET /api/admin/posts
export default function AdminPostsPage() {
  const {
    list, items, total, pages, rangeFrom, rangeTo, page, setPage, pageSize,
    input, changeInput, search, scope, changeScope, status, changeStatus,
    from, changeFrom, to, changeTo, badRange, hasFilter, resetFilters,
    stats, busyId, hiding, setHiding, requestToggle, confirmHide,
  } = useAdminPosts();
  const [viewing, setViewing] = useState<AdminPost | null>(null);

  return (
    <>
      <AdminPageHeader
        breadcrumb={[{ label: "Tổng quan", to: "/admin/dashboard" }, { label: "Cộng đồng" }, { label: "Quản lý bài đăng" }]}
        title="Quản lý bài đăng"
        desc="Theo dõi, tìm kiếm, kiểm duyệt và đăng bài viết trên cộng đồng."
        action={
          <Link
            to="/admin/posts/new"
            className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 active:scale-95"
          >
            <Plus size={18} /> Tạo bài viết
          </Link>
        }
      />

      <div className="-mt-16 space-y-5 px-4 pb-10 md:px-8">
        <PostScopeTabs value={scope} stats={stats} onChange={changeScope} />

        <section className="rounded-2xl border border-line bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 p-4">
            <form onSubmit={search} role="search" className="flex min-w-60 flex-1 gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={input}
                  onChange={(e) => changeInput(e.target.value)}
                  placeholder="Tìm theo nội dung, tên người đăng..."
                  aria-label="Tìm bài viết"
                  className={`${field} w-full pl-11 pr-4`}
                />
              </div>
              <button
                type="submit"
                className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95"
              >
                <Search size={15} /> Tìm kiếm
              </button>
            </form>
            <FilterSelect<AdminPostStatusFilter>
              label="Trạng thái"
              value={status}
              onChange={changeStatus}
              options={[
                { value: "all", label: "Tất cả", desc: `${stats.all} bài viết`, icon: LayoutList },
                { value: "active", label: "Đang hiển thị", desc: `${stats.all - stats.hidden} bài viết`, icon: Eye },
                { value: "hidden", label: "Đang ẩn", desc: `${stats.hidden} bài viết`, icon: EyeOff },
              ]}
            />
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => changeFrom(e.target.value)}
                aria-label="Từ ngày"
                className={`${field} min-w-0 flex-1 px-3 sm:flex-none`}
              />
              <span className="text-sm text-body">→</span>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => changeTo(e.target.value)}
                aria-label="Đến ngày"
                className={`${field} min-w-0 flex-1 px-3 sm:flex-none`}
              />
            </div>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasFilter}
              className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-heading transition hover:bg-primary-50 disabled:opacity-50"
            >
              <RotateCcw size={15} /> Đặt lại
            </button>
          </div>
          {badRange && <p role="alert" className="px-4 pb-3 text-xs text-danger">Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.</p>}

          <div className="border-t border-line">
            {list.waiting ? (
              <TableSkeleton rows={pageSize} label="Đang tải bài viết" />
            ) : list.status === "error" ? (
              <div role="alert" className="px-6 py-14 text-center">
                <p className="font-semibold text-heading">{badRange ? "Khoảng ngày không hợp lệ" : "Không tải được danh sách bài viết"}</p>
                <button onClick={list.retry} className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">Thử lại</button>
              </div>
            ) : items.length === 0 ? (
              <p className="px-6 py-14 text-center text-sm text-body">
                {hasFilter ? "Không có bài viết phù hợp với bộ lọc." : "Chưa có bài viết nào."}
              </p>
            ) : (
              <PostsTable items={items} busyId={busyId} onToggleActive={requestToggle} onHide={setHiding} onView={setViewing} />
            )}
          </div>

          {list.status === "ready" && total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs text-body">
              <p>Hiển thị {rangeFrom}–{rangeTo} trong {total} bài viết</p>
              {pages > 1 && <Pagination page={page} totalPages={pages} onChange={setPage} />}
            </div>
          )}
        </section>
      </div>

      {viewing && <PostDetailModal post={viewing} onClose={() => setViewing(null)} />}

      {hiding && (
        <ConfirmDialog
          title="Ẩn bài viết?"
          message="Bạn có chắc chắn muốn ẩn bài viết này không? Người dùng (kể cả người đăng) sẽ không thấy bài trên bảng tin nữa. Bạn có thể hiển thị lại bất cứ lúc nào."
          confirmLabel="Ẩn bài"
          busy={busyId === hiding.id}
          onConfirm={confirmHide}
          onClose={() => setHiding(null)}
        />
      )}
    </>
  );
}
