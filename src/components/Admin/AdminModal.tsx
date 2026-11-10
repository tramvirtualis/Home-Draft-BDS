import { useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import useFocusTrap from "../common/useFocusTrap";

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  // Hộp thoại có form: bấm ra ngoài không đóng để khỏi mất dữ liệu đang nhập (chỉ đóng bằng nút)
  persistent?: boolean;
};

// Hộp thoại chung cho form / xem chi tiết trong trang quản trị
export default function AdminModal({ title, onClose, children, persistent = false }: Props) {
  const root = useRef<HTMLDivElement>(null);
  useFocusTrap(root, true, onClose);

  return createPortal(
    <div className="fixed inset-0 overflow-y-auto z-[100] flex items-center justify-center bg-ink-950/50 p-4 max-sm:p-0 backdrop-blur-sm" onClick={persistent ? undefined : onClose}>
      <div
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="animate-page-in m-auto max-sm:h-full max-sm:max-h-full max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-h-[calc(100dvh-2rem)] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="heading-display text-lg text-heading">{title}</h2>
          <button onClick={onClose} aria-label="Đóng" className="rounded-full p-2 text-body hover:bg-primary-50">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
