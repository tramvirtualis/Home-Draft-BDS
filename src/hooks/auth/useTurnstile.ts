import { useCallback, useState } from "react";

// Chạy local chưa có key thì dùng site key test của Cloudflare (luôn qua); bản build thật không có key thì ẩn widget
export const TURNSTILE_SITE_KEY: string =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || (import.meta.env.DEV ? "1x00000000000000000000AA" : "");

/**
 Token Turnstile của form. Mỗi token chỉ dùng được 1 lần:
 gửi form thất bại thì gọi reset() để widget cấp token mới.
 */
export function useTurnstile() {
  const [token, setToken] = useState("");
  const [widgetKey, setWidgetKey] = useState(0);

  const reset = useCallback(() => {
    setToken("");
    setWidgetKey((k) => k + 1);
  }, []);

  return { token, setToken, widgetKey, reset, ready: !TURNSTILE_SITE_KEY || !!token };
}
