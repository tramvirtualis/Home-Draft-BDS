import { Building2, Image, Smile, Video } from "lucide-react";
import EmojiPickerButton from "../../common/EmojiPickerButton";
import { POST_MAX_IMAGES, POST_VIDEO_ENABLED } from "../../../types/social/social.types";

const iconButton =
  "flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

type Props = {
  imageCount: number;
  // Đang dùng màu nền: không thêm được ảnh / video
  mediaDisabled?: boolean;
  disabled?: boolean;
  onPickImages: () => void;
  onPickVideo: () => void;
  onEmoji: (emoji: string) => void;
  // Mở / đóng ô gắn dự án; projectActive = đang mở ô tìm hoặc đã gắn dự án
  onPickProject: () => void;
  projectActive?: boolean;
};

// Khung "Thêm vào bài viết" trong modal tạo bài viết (giống Facebook): ảnh, video, dự án, cảm xúc
export default function ComposerAddBar({
  imageCount,
  mediaDisabled = false,
  disabled,
  onPickImages,
  onPickVideo,
  onEmoji,
  onPickProject,
  projectActive = false,
}: Props) {
  return (
    <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
      <span className="text-sm font-semibold text-gray-700">
        Thêm vào bài viết
        {imageCount > 0 && <span className="ml-1 font-normal text-gray-500">({imageCount}/{POST_MAX_IMAGES} ảnh)</span>}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPickImages}
          disabled={disabled || mediaDisabled || imageCount >= POST_MAX_IMAGES}
          aria-label="Thêm ảnh"
          title={mediaDisabled ? "Bỏ màu nền để thêm ảnh" : "Ảnh"}
          className={iconButton}
        >
          <Image size={22} className="text-green-500" />
        </button>
        {POST_VIDEO_ENABLED && (
          <button
            type="button"
            onClick={onPickVideo}
            disabled={disabled || mediaDisabled}
            aria-label="Thêm video"
            title={mediaDisabled ? "Bỏ màu nền để thêm video" : "Video (tối đa 20MB)"}
            className={iconButton}
          >
            <Video size={22} className="text-red-500" />
          </button>
        )}
        <button
          type="button"
          onClick={onPickProject}
          disabled={disabled}
          aria-label="Gắn dự án"
          aria-pressed={projectActive}
          title="Gắn dự án"
          className={`${iconButton} ${projectActive ? "bg-sky-50" : ""}`}
        >
          <Building2 size={22} className="text-sky-500" />
        </button>
        <EmojiPickerButton title="Cảm xúc" disabled={disabled} onSelect={onEmoji} placement="top" align="right" className={iconButton}>
          <Smile size={22} className="text-yellow-500" />
        </EmojiPickerButton>
      </div>
    </div>
  );
}
