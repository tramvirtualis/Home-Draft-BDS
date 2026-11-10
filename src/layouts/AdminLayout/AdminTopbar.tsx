import { useState } from "react";
import { HelpCircle, Bell, Menu } from "lucide-react";
import useUnreadNotificationCount from "../../hooks/notification/useUnreadNotificationCount";
import NotificationDrawer from "../../components/Notification/NotificationDrawer";
import AdminAccountMenu from "./AdminAccountMenu";

// Thanh trên trang quản trị: kính trắng mờ dính đầu trang, thông báo và menu tài khoản
export default function AdminTopbar({ onMenu }: { onMenu: () => void }) {
  const unread = useUnreadNotificationCount();
  // Bấm chuông mở ngăn thông báo ngay tại chỗ (giống Header bên người dùng), không chuyển sang /account
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center gap-2 border-b border-white/80 bg-white/75 px-3 backdrop-blur-xl sm:gap-4 sm:px-4 md:px-8">
      <button onClick={onMenu} aria-label="Mở menu" className="shrink-0 rounded-full p-2 text-heading hover:bg-primary-50 lg:hidden">
        <Menu size={22} />
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <button aria-label="Trợ giúp" className="hidden h-10 w-10 items-center justify-center rounded-full text-heading transition hover:bg-primary-50 sm:flex">
          <HelpCircle size={20} />
        </button>
        <button
          type="button"
          onClick={() => setNotifOpen(true)}
          aria-label={unread > 0 ? `Thông báo, ${unread} chưa đọc` : "Thông báo"}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-heading transition hover:bg-primary-100"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span
              key={unread}
              aria-hidden
              className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] animate-[bounce_0.6s_ease-out_1] items-center justify-center rounded-full bg-pop-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
        {notifOpen && <NotificationDrawer onClose={() => setNotifOpen(false)} />}
        <AdminAccountMenu />
      </div>
    </header>
  );
}
