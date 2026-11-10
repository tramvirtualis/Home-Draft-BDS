import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../../api/http";
import { useToast } from "../../components/common/toastContext";
import { POST_SCOPE, type CreatePostRequest } from "../../types/social/social.types";

// Bài đang đăng: "uploading" đang gửi file lên, "processing" đã gửi xong và chờ server lưu ảnh, "error" lỗi chờ thử lại
export type PostUpload = {
  id: number;
  request: CreatePostRequest;
  // Tỉ lệ đã gửi lên (0 → 1)
  progress: number;
  status: "uploading" | "processing" | "error";
  error: string | null;
};

type CreatePost = (request: CreatePostRequest, onProgress: (ratio: number) => void) => Promise<unknown>;

// Đăng bài chạy ngầm giống Facebook: bấm Đăng là đóng modal, đầu bảng tin hiện thẻ bài kèm thanh tiến trình,
// người dùng vẫn lướt bình thường; đăng xong thì thẻ biến mất, bài thật lên đầu danh sách
export function usePostUploads(createPost: CreatePost) {
  const [uploads, setUploads] = useState<PostUpload[]>([]);
  const nextId = useRef(1);
  const toast = useToast();

  const update = useCallback(
    (id: number, patch: Partial<PostUpload>) =>
      setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u))),
    [],
  );

  const run = useCallback(
    async (id: number, request: CreatePostRequest) => {
      update(id, { status: "uploading", progress: 0, error: null });
      try {
        await createPost(request, (ratio) =>
          update(id, ratio >= 1 ? { progress: 1, status: "processing" } : { progress: ratio }),
        );
        setUploads((prev) => prev.filter((u) => u.id !== id));
        toast.show(request.scope === POST_SCOPE.PRIVATE ? "Đã đăng bài viết ở chế độ chỉ mình tôi" : "Đã đăng bài viết");
      } catch (err) {
        const message = getErrorMessage(err);
        update(id, { status: "error", error: message });
        toast.show(message, "error");
      }
    },
    [createPost, update, toast],
  );

  const start = useCallback(
    (request: CreatePostRequest) => {
      const id = nextId.current++;
      setUploads((prev) => [{ id, request, progress: 0, status: "uploading", error: null }, ...prev]);
      void run(id, request);
    },
    [run],
  );

  const retry = useCallback(
    (upload: PostUpload) => void run(upload.id, upload.request),
    [run],
  );

  const dismiss = useCallback((id: number) => setUploads((prev) => prev.filter((u) => u.id !== id)), []);

  // Đang tải mà đóng tab / tải lại trang thì trình duyệt hỏi lại, tránh mất bài đang đăng
  const busy = uploads.some((u) => u.status !== "error");
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  return { uploads, start, retry, dismiss };
}
