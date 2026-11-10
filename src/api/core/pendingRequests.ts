import type { InternalAxiosRequestConfig } from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    // true: request chạy ngầm (đánh dấu đã đọc, đăng ký thiết bị...) → không bật lớp loading toàn màn hình
    silentLoading?: boolean;
    _loadingId?: number;
  }
}

// Đếm các request ghi (POST/PUT/PATCH/DELETE) đang chạy để hiện LoadingOverlay toàn cục
const pending = new Set<number>();
// Đếm riêng request đọc (GET) đang chạy: layout chờ dữ liệu trang tải xong mới hiện footer
const reads = new Set<number>();
const listeners = new Set<() => void>();
let nextId = 1;

const emit = () => listeners.forEach((l) => l());

const WRITE_METHODS = ["post", "put", "patch", "delete"];

export const trackRequest = (config: InternalAxiosRequestConfig) => {
  // Request gửi lại sau khi refresh token đã mang sẵn id (axios copy config) → không đếm lại
  if (config._loadingId || config.silentLoading) return config;
  config._loadingId = nextId++;
  if (WRITE_METHODS.includes((config.method ?? "get").toLowerCase())) pending.add(config._loadingId);
  else reads.add(config._loadingId);
  emit();
  return config;
};

// Gọi cả khi thành công lẫn lỗi; Set.delete nên gọi nhiều lần cũng không sao
export const untrackRequest = (config?: InternalAxiosRequestConfig) => {
  if (!config?._loadingId) return;
  const removed = pending.delete(config._loadingId);
  if (reads.delete(config._loadingId) || removed) emit();
};

export const subscribePending = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getPendingCount = () => pending.size;
export const getPendingReadCount = () => reads.size;
