import { useEffect, useRef, useState } from "react";
import { Flag, MoreVertical, Trash2, type LucideIcon } from "lucide-react";
import ReportPostModal from "./ReportPostModal";
import ConfirmDialog from "../../Admin/ConfirmDialog";
import { useLoginRedirect } from "../../../hooks/auth/useLoginRedirect";

type Props = {
  postId: number;
  // Bài của chính người đang xem: có "Xóa", không có "Báo cáo"
  isOwner: boolean;
  // Khách bấm "Báo cáo" thì sang trang đăng nhập
  isGuest: boolean;
  // Có thì chủ bài thấy mục "Xóa bài viết"; lỗi được ném ra để giữ hộp thoại và cho bấm lại
  onDelete?: () => Promise<void>;
};

type MenuItem = {
  key: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  // Mục nguy hiểm (xóa...): tô đỏ
  danger?: boolean;
  onSelect: () => void;
};

type Dialog = "report" | "delete" | null;

// Menu 3 chấm dọc ở góc phải bài viết. Thêm thao tác mới (sửa, lưu bài...) thì thêm mục vào items bên dưới
export default function PostMenu({ postId, isOwner, isGuest, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const goLogin = useLoginRedirect();

  // Bấm ra ngoài hoặc Esc thì đóng menu
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items: MenuItem[] = [];
  if (isOwner && onDelete) {
    items.push({
      key: "delete",
      label: "Xóa bài viết",
      desc: "Không ai xem được bài này nữa",
      icon: Trash2,
      danger: true,
      onSelect: () => setDialog("delete"),
    });
  }
  if (!isOwner) {
    items.push({
      key: "report",
      label: "Báo cáo bài viết",
      desc: "Bài viết có nội dung vi phạm",
      icon: Flag,
      onSelect: () => (isGuest ? goLogin() : setDialog("report")),
    });
  }

  const confirmDelete = async () => {
    if (!onDelete) return;
    setBusy(true);
    try {
      await onDelete();
      setDialog(null);
    } catch {
      // Bên gọi đã báo lỗi bằng toast
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      <div ref={root} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Thao tác với bài viết"
          title="Thao tác với bài viết"
          className={`rounded-full p-2 text-muted transition hover:bg-gray-100 hover:text-heading ${open ? "bg-gray-100 text-heading" : ""}`}
        >
          <MoreVertical size={18} />
        </button>

        {open && (
          <div role="menu" className="absolute right-0 top-full z-20 mt-1 w-60 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
            {items.map(({ key, label, desc, icon: Icon, danger, onSelect }) => (
              <button
                key={key}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onSelect();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition ${danger ? "hover:bg-danger/10" : "hover:bg-gray-100"}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${danger ? "bg-danger/10 text-danger" : "bg-gray-100 text-gray-600"}`}
                >
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-semibold ${danger ? "text-danger" : "text-gray-800"}`}>{label}</span>
                  <span className="block text-xs text-gray-500">{desc}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {dialog === "report" && <ReportPostModal postId={postId} onClose={() => setDialog(null)} />}
      {dialog === "delete" && (
        <ConfirmDialog
          title="Xóa bài viết?"
          message="Bài viết sẽ bị xóa khỏi bảng tin và trang cá nhân của bạn, không ai xem được nữa."
          confirmLabel="Xóa bài viết"
          busy={busy}
          onConfirm={() => void confirmDelete()}
          onClose={() => !busy && setDialog(null)}
        />
      )}
    </>
  );
}
