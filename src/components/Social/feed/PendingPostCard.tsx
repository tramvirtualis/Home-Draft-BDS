import { AlertCircle, RotateCcw, X } from "lucide-react";
import Avatar from "../../common/Avatar";
import { useObjectUrls } from "../../../hooks/social/useObjectUrls";
import type { PostUpload } from "../../../hooks/social/usePostUploads";
import type { SocialUser } from "../../../types/social/social.types";

// Số ảnh xem trước tối đa trên thẻ; còn lại hiện "+N"
const MAX_THUMBS = 4;
// Mảng rỗng dùng chung: tránh tạo mảng mới mỗi lần render làm useObjectUrls tạo lại link
const NO_IMAGES: File[] = [];

type Props = {
  upload: PostUpload;
  user: SocialUser;
  onRetry: (upload: PostUpload) => void;
  onDismiss: (id: number) => void;
};

// Thẻ bài đang đăng ở đầu bảng tin (giống Facebook): người đăng, nội dung, ảnh xem trước và thanh tiến trình.
// Gửi file chiếm 90% thanh; phần còn lại là lúc server lưu ảnh (chưa biết bao lâu nên thanh nhấp nháy)
export default function PendingPostCard({ upload, user, onRetry, onDismiss }: Props) {
  const { request, progress, status, error } = upload;
  const thumbs = useObjectUrls(request.images ?? NO_IMAGES);
  const percent = status === "processing" ? 95 : Math.round(progress * 90);
  const failed = status === "error";
  const label = failed ? "Đăng bài không thành công" : status === "processing" ? "Đang xử lý..." : `Đang đăng... ${percent}%`;

  return (
    <article className="rounded-2xl border border-line bg-white p-4" aria-busy={!failed}>
      <header className="mb-3 flex items-center gap-3">
        <Avatar src={user.avatarUrl} fullName={user.fullName} className="h-10 w-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{user.fullName}</p>
          <p className={`flex items-center gap-1 text-xs ${failed ? "text-danger" : "text-gray-500"}`} role="status">
            {failed && <AlertCircle size={12} />}
            {label}
          </p>
        </div>
      </header>

      {/* Bản xem trước mờ đi trong lúc đăng */}
      <div className={failed ? "" : "opacity-60"}>
        {request.content?.trim() && (
          <p className="mb-3 line-clamp-3 whitespace-pre-line break-words text-sm text-gray-800">{request.content}</p>
        )}
        {thumbs.length > 0 && (
          <div className="mb-3 grid grid-cols-4 gap-1.5">
            {thumbs.slice(0, MAX_THUMBS).map((url, i) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img src={url} alt="" className="h-full w-full object-cover" />
                {i === MAX_THUMBS - 1 && thumbs.length > MAX_THUMBS && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                    +{thumbs.length - MAX_THUMBS}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {failed ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-danger/5 px-3 py-2">
          <p className="min-w-0 flex-1 text-sm text-danger">{error}</p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => onDismiss(upload.id)}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              <X size={14} /> Hủy
            </button>
            <button
              type="button"
              onClick={() => onRetry(upload)}
              className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              <RotateCcw size={14} /> Thử lại
            </button>
          </div>
        </div>
      ) : (
        <div
          className="h-1.5 overflow-hidden rounded-full bg-gray-100"
          role="progressbar"
          aria-label="Tiến trình đăng bài"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div
            className={`h-full rounded-full bg-primary-600 transition-[width] duration-300 ${status === "processing" ? "animate-pulse" : ""}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </article>
  );
}
