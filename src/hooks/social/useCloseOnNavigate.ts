import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Đóng modal khi URL đổi (bấm hashtag / thẻ dự án bên trong modal, nút Back): không để modal cũ đè lên trang mới
export function useCloseOnNavigate(onClose: () => void) {
  const { key } = useLocation();
  const openedAt = useRef(key);

  useEffect(() => {
    if (key !== openedAt.current) onClose();
  }, [key, onClose]);
}
