import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import RagAskPanel from "../../components/Admin/rag/RagAskPanel";
import RagChunksModal from "../../components/Admin/rag/RagChunksModal";
import RagOverview from "../../components/Admin/rag/RagOverview";
import RagSourcesPanel from "../../components/Admin/rag/RagSourcesPanel";
import { useAdminRag } from "../../hooks/rag/useAdminRag";
import { selectIsSuperAdmin, selectPermissions, useAppSelector } from "../../store";
import type { RagSourceKind } from "../../types/rag/rag.types";

type Tab = "overview" | "sources" | "ask";
const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Tổng quan" },
  { key: "sources", label: "Nguồn dữ liệu" },
  { key: "ask", label: "Hỏi thử" },
];

type Viewing = { kind: RagSourceKind; id: number; title: string };

/**
 Quản lý trợ lý AI (/admin/chatbot). Chỉ quản lý phần AI đọc được; thêm / sửa tài liệu ở /admin/documents, dự án ở /admin/projects.
 Bình thường không cần bấm gì: RAG service tự index tài liệu mỗi 5 phút, dự án mỗi 15 phút.
 */
export default function AdminChatbotPage() {
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const permissions = useAppSelector(selectPermissions);
  const canManage = isSuperAdmin || permissions.includes("RAG_MANAGE");

  const [tab, setTab] = useState<Tab>("overview");
  const [viewing, setViewing] = useState<Viewing | null>(null);
  const { load, reloadToken, refresh, retry, busyKey, reindexingAll, reindex, reindexAll } = useAdminRag();

  const viewChunks = (kind: RagSourceKind, id: number, title: string) => setViewing({ kind, id, title });

  return (
    <>
      <AdminPageHeader
        breadcrumb={[{ label: "Tổng quan", to: "/admin/dashboard" }, { label: "Hệ thống" }, { label: "Quản lý chat bot" }]}
        title="Trợ lý AI"
        desc="Theo dõi dữ liệu chatbot đã học từ tài liệu và dự án. Hệ thống tự cập nhật định kỳ, chỉ cần can thiệp khi có lỗi."
        action={
          <div className="flex gap-2">
            <button
              onClick={refresh}
              className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-heading shadow-sm transition hover:bg-primary-50"
            >
              <RefreshCw size={16} /> Tải lại
            </button>
            {canManage && (
              <button
                onClick={() => void reindexAll()}
                disabled={reindexingAll}
                title="Index các tài liệu đang chờ và dự án có thay đổi, không cần chờ lượt tự động"
                className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
              >
                {reindexingAll ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Index ngay
              </button>
            )}
          </div>
        }
      />

      <div className="-mt-16 space-y-5 px-4 pb-10 md:px-8">
        <div className="inline-flex rounded-2xl border border-line bg-white p-1 shadow-sm" role="tablist" aria-label="Mục quản lý">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${tab === t.key ? "bg-primary-600 text-white" : "text-body hover:text-primary-700"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" &&
          (load.status === "loading" ? (
            <div className="grid animate-pulse gap-4 md:grid-cols-3" aria-busy="true" aria-label="Đang tải trạng thái">
              {[0, 1, 2].map((n) => <div key={n} className="h-48 rounded-2xl bg-white shadow-sm" />)}
            </div>
          ) : load.status === "error" ? (
            <div role="alert" className="rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-sm">
              <p className="font-semibold text-heading">Không kết nối được trợ lý AI</p>
              <p className="mt-1 text-sm text-body">RAG service có thể đang tắt. Danh sách nguồn ở tab Nguồn dữ liệu vẫn xem được.</p>
              <button onClick={retry} className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">
                Thử lại
              </button>
            </div>
          ) : (
            <RagOverview status={load.data} canManage={canManage} busyKey={busyKey} onReindex={(k, id, t) => void reindex(k, id, t)} onViewChunks={viewChunks} />
          ))}

        {tab === "sources" && (
          <RagSourcesPanel
            canManage={canManage}
            busyKey={busyKey}
            reloadToken={reloadToken}
            onReindex={(k, id, t) => void reindex(k, id, t)}
            onViewChunks={viewChunks}
          />
        )}

        {tab === "ask" && <RagAskPanel canManage={canManage} />}
      </div>

      {viewing && <RagChunksModal {...viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
