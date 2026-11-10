import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { store } from "./store";
import authService from "./services/auth/authService";
import { initSmoothScroll } from "./utils/smoothScroll";
import "./assets/styles/index.css";

// Khôi phục phiên đăng nhập từ cookie refreshToken (access token chỉ nằm trên RAM)
authService.restoreSession();

// Mỗi trang là 1 file JS riêng (React.lazy). Deploy bản mới thì file của bản cũ không còn trên server:
// tab đang mở chuyển trang sẽ tải hụt → tải lại trang 1 lần để lấy bản mới (chặn lặp nếu lỗi do mất mạng)
const RELOAD_KEY = "chunk-reload-at";
window.addEventListener("vite:preloadError", (event) => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < 10_000) return;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // sessionStorage bị chặn: vẫn tải lại
  }
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
  // </StrictMode>
);
