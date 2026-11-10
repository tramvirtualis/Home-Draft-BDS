import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Cuộn mượt có quán tính cho toàn site (một bản Lenis dùng chung, trang chủ cũng dùng bản này).
// Chỉ bật cho chuột / touchpad: màn cảm ứng đã có quán tính gốc của máy. Người dùng chọn giảm chuyển động thì không bật.
let lenis: Lenis | null = null;

export const getLenis = () => lenis;

export function initSmoothScroll() {
  // Tải lại trang luôn bắt đầu từ đầu trang, trình duyệt không tự nhảy về vị trí cũ
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (lenis || typeof window === "undefined") return;
  if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  lenis = new Lenis({
    lerp: 0.14, // càng nhỏ càng trôi lâu; 0.14: mượt vừa phải, dừng nhanh, không bị "lướt quá"
    wheelMultiplier: 1,
    autoRaf: true,
    allowNestedScroll: true, // khung con cuộn được (menu, khung chat, bảng) vẫn cuộn bên trong
    // Bản đồ mặt bằng (lăn chuột để zoom) và popup đang mở: để trình duyệt tự xử lý, không cuộn trang phía sau
    prevent: (node) => !!node.closest?.('.leaflet-container, [aria-modal="true"]'),
  });
}

// Về đầu trang ngay lập tức (không trôi)
export function scrollToTopNow() {
  lenis?.scrollTo(0, { immediate: true, force: true });
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}
