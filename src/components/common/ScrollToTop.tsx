import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollToTopNow } from "../../utils/smoothScroll";

// Sang trang khác (đổi đường dẫn) thì về đầu trang trước khi trang mới hiện ra (không thấy trang mới ở vị trí cũ rồi mới nhảy).
// Link có #anchor thì để trình duyệt tự cuộn tới mục đó.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) return;
    scrollToTopNow();
  }, [pathname, hash]);

  return null;
}
