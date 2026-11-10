import { useEffect, useState } from "react";

// Hiện muộn một nhịp: file trang tải nhanh (đã có cache) thì không nháy vòng quay
const SHOW_DELAY_MS = 100;

// Chỗ chờ khi đang tải file JS của trang (React.lazy). fullScreen: trang không nằm trong layout nào
export default function PageFallback({
  fullScreen = false,
}: {
  fullScreen?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex items-center justify-center ${
        fullScreen ? "min-h-screen bg-page" : "min-h-[50vh]"
      }`}
    >
      {visible && (
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      )}
      <span className="sr-only">Đang tải trang</span>
    </div>
  );
}
