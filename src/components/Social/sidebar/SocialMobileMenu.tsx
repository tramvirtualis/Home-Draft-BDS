import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import SocialMenu from "../SocialMenu";
import UserCard from "./UserCard";
import useFocusTrap from "../../common/useFocusTrap";
import { useCloseOnNavigate } from "../../../hooks/social/useCloseOnNavigate";
import type { SocialUser } from "../../../types/social/social.types";

type Props = {
  // null = khách: ẩn thẻ người dùng
  user: SocialUser | null;
  activeId: string;
  onSelect: (id: string) => void;
};

type SheetProps = Props & { onClose: () => void };

// Portal ra body: ancestor animate-page-in có transform làm "fixed" bị định vị sai
function MenuSheet({ user, activeId, onSelect, onClose }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);
  useCloseOnNavigate(onClose);

  // Chọn lại đúng mục đang xem thì URL không đổi, nên phải tự đóng
  const select = (id: string) => {
    onSelect(id);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu cộng đồng">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        tabIndex={-1}
        className="animate-sheet-up absolute inset-x-0 bottom-0 max-h-[85vh] space-y-3 overflow-y-auto rounded-t-3xl bg-page px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] outline-none"
      >
        <span className="mx-auto block h-1 w-10 rounded-full bg-line" aria-hidden />
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-heading">Menu cộng đồng</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng menu"
            className="rounded-full p-1.5 text-muted transition hover:bg-white hover:text-heading"
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        {user && <UserCard user={user} onClick={() => select("profile")} />}
        <SocialMenu activeId={activeId} onSelect={select} />
      </div>
    </div>,
    document.body,
  );
}

// Cột trái bị ẩn dưới lg: nút cạnh ô tìm kiếm mở thẻ hồ sơ + menu trong bottom sheet
export default function SocialMobileMenu(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mở menu cộng đồng"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-white text-heading transition hover:border-primary-300 hover:text-primary-600 active:scale-95 lg:hidden"
      >
        <Menu size={20} aria-hidden />
      </button>
      {open && <MenuSheet {...props} onClose={() => setOpen(false)} />}
    </>
  );
}
