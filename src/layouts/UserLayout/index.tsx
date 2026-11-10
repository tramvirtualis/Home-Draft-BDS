import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { getPendingReadCount, subscribePending } from "../../api/core/pendingRequests";
import PageFallback from "../../components/common/PageFallback";
import { Outlet, useLocation } from "react-router-dom";
// Hoạt hình khung chat + robot trợ lý (keyframes hd-chat-open, hd-msg-in, hd-mascot-*)
import "../../components/Home/home.css";
import HavenHeader from "../../components/Home/HavenHeader";
import Chatbot from "../../components/Home/Chatbot";
import SkylineFooter from "../../components/Home/SkylineFooter";
import { FONT } from "../../components/Home/urbanUi";
import ToastProvider from "../../components/common/Toast";
import NotificationRealtime from "../../components/Notification/NotificationRealtime";
import GlobalLoadingOverlay from "../../components/common/GlobalLoadingOverlay";

// Khung chung của mọi trang người dùng, cùng giao diện với trang chủ Hubtech:
// header (HavenHeader), chân trang chữ "hubtech" khổng lồ (SkylineFooter), trợ lý AI kiểu phẳng, font Inter Tight
export default function UserLayout() {
  const { pathname } = useLocation();
  // Bỏ slug dự án khỏi key: /projects/5 → /projects/5-ten-du-an (chuyển sang URL thân thiện)
  // không được làm trang mount lại, nếu không toàn bộ API chi tiết dự án bị gọi lần hai
  const pageKey = pathname.replace(/^(\/projects\/\d+)-[^/]*/, "$1");

  // Footer chỉ hiện khi dữ liệu của trang vừa mở đã tải xong (không còn request đọc nào đang chạy),
  // để không thấy footer hiện trước rồi bị nội dung đẩy xuống. Footer vẫn giữ chỗ nên không làm xô bố cục.
  const reading = useSyncExternalStore(subscribePending, () => getPendingReadCount() > 0);
  const [footerReady, setFooterReady] = useState(false);
  useEffect(() => {
    setFooterReady(false);
    const cap = setTimeout(() => setFooterReady(true), 6000); // request chạy định kỳ / treo: không giấu footer mãi
    return () => clearTimeout(cap);
  }, [pageKey]);
  useEffect(() => {
    if (footerReady || reading) return;
    // Chờ một nhịp: trang vừa hiện chưa kịp gửi request lấy dữ liệu
    const settle = setTimeout(() => setFooterReady(true), 300);
    return () => clearTimeout(settle);
  }, [reading, footerReady, pageKey]);
  return (
    // ToastProvider ở đây để mọi trang người dùng hiển thị được thông báo (lưu dự án, lỗi API...)
    <ToastProvider>
      <NotificationRealtime />
      {/* Gửi form / tạo / sửa / xoá tự hiện vòng loading (gồm cả khu tài khoản, nhà tuyển dụng);
          thao tác nhỏ như thích, bình luận, lưu tin, chatbot đánh dấu silentLoading ở service */}
      <GlobalLoadingOverlay />
      <div className="flex min-h-screen flex-col bg-page" style={{ fontFamily: FONT }}>
        <HavenHeader font='"Be Vietnam Pro", system-ui, sans-serif' dark />
        {/* Header cố định (fixed): chừa đúng chiều cao header để nội dung không bị che */}
        <div className="h-[77px] shrink-0" aria-hidden />
        {/* Nội dung cao ít nhất bằng màn hình trừ header: lúc trang / dữ liệu đang tải, footer nằm sẵn dưới mép màn hình
            thay vì lộ ra rồi bị đẩy xuống khi nội dung hiện (trông giật) */}
        <main className="min-h-[calc(100svh-77px)] flex-grow">
          {/* Suspense nằm ngoài key: chuyển trang (React Router chạy trong startTransition) thì giữ nguyên trang cũ
              tới khi file JS trang mới tải xong, không nháy vòng quay / khoảng trống. key theo đường dẫn: trang mới hiện dần */}
          <Suspense fallback={<PageFallback />}>
            <div key={pageKey} className="animate-page-in">
              <Outlet />
            </div>
          </Suspense>
        </main>
        <div className={`transition-opacity duration-300 ${footerReady ? "opacity-100" : "invisible opacity-0"}`}>
          <SkylineFooter />
        </div>
      </div>
      {/* Trợ lý AI: nằm ở layout nên trang người dùng nào cũng có; z-[60] để nằm trên nội dung trang */}
      <div className="relative z-[60]">
        <Chatbot variant="urban" />
      </div>
    </ToastProvider>
  );
}
