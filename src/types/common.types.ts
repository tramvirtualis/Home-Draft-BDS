// Khớp Page<T> của Spring Data
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// Khớp CursorResponse bên BE: danh sách cuộn vô hạn, gửi nextCursor ở lần tải sau; null = đã hết
export interface CursorPage<T> {
  items: T[];
  nextCursor: number | null;
  hasMore: boolean;
  // Tổng số dòng: chỉ danh sách cần hiện tổng mới có, và chỉ ở lần tải đầu; còn lại null
  total: number | null;
}
