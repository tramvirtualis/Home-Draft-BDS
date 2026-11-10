import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Avatar from "../../common/Avatar";
import ErrorAlert from "../../common/ErrorAlert";
import useFocusTrap from "../../common/useFocusTrap";
import ComposerAddBar from "./ComposerAddBar";
import ComposerBackgroundPicker from "./ComposerBackgroundPicker";
import ComposerHashtagSuggestions from "./ComposerHashtagSuggestions";
import ComposerImagePreviews from "./ComposerImagePreviews";
import ComposerProjectPicker from "./ComposerProjectPicker";
import ComposerVideoPreview from "./ComposerVideoPreview";
import ScopeSelect from "./ScopeSelect";
import { backgroundBoxClass, backgroundTextSize } from "../post/postBackground";
import { useHashtagSuggest } from "../../../hooks/social/useHashtagSuggest";
import { usePostBackgrounds } from "../../../hooks/social/usePostBackgrounds";
import type { PostComposerState } from "../../../hooks/social/usePostComposer";
import { POST_VIDEO_TYPES, type SocialUser } from "../../../types/social/social.types";

type Props = {
  user: SocialUser;
  composer: PostComposerState;
  onClose: () => void;
};

// Modal "Tạo bài viết" giống Facebook: người đăng + phạm vi, ô nhập (hoặc khung màu nền), màu nền, ảnh / video, nút Đăng.
// Đóng modal không mất bài nháp vì state nằm ở PostComposer
export default function PostComposerModal({ user, composer: c, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const backgrounds = usePostBackgrounds();
  const hashtags = useHashtagSuggest(c.textareaRef, c.setContent);
  // Ô tìm dự án; đã gắn dự án thì luôn hiện thẻ dự án
  const [projectSearchOpen, setProjectSearchOpen] = useState(false);
  useFocusTrap(root, true, onClose);

  // useFocusTrap focus nút đầu tiên (nút đóng); đặt con trỏ vào cuối ô nhập để gõ tiếp luôn.
  // Mở lại với bài nháp dài: giãn ô nhập ngay (useAutoResizeTextarea chỉ chạy khi nội dung đổi)
  useEffect(() => {
    const el = c.textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [c.textareaRef]);

  // Bấm Đăng: đóng modal ngay, bài được đăng ngầm (thẻ có thanh tiến trình ở đầu bảng tin)
  const submit = () => {
    if (c.submit()) onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-labelledby="composer-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <header className="relative border-b border-gray-200 py-3 text-center">
          <h2 id="composer-title" className="text-lg font-bold">Tạo bài viết</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 p-1.5 hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </header>

        <div className="overflow-y-auto p-4">
          <div className="mb-3 flex items-center gap-3">
            <Avatar src={user.avatarUrl} fullName={user.fullName} className="h-10 w-10" />
            <div>
              <p className="font-semibold">{user.fullName}</p>
              <ScopeSelect value={c.scope} onChange={c.setScope} align="left" />
            </div>
          </div>

          {/* Có màu nền: ô nhập thành khung màu, chữ to canh giữa */}
          <div
            className={c.background ? backgroundBoxClass : ""}
            style={c.background ? { background: c.background.value, color: c.background.textColor } : undefined}
          >
            <textarea
              ref={c.textareaRef}
              value={c.content}
              onChange={(e) => {
                c.setContent(e.target.value);
                hashtags.sync();
              }}
              onKeyDown={hashtags.onKeyDown}
              onKeyUp={(e) => (e.key === "ArrowLeft" || e.key === "ArrowRight") && hashtags.sync()}
              onClick={hashtags.sync}
              onBlur={hashtags.close}
              maxLength={c.maxLength}
              placeholder={`${user.fullName} ơi, bạn đang nghĩ gì?`}
              aria-label="Nội dung bài viết"
              rows={c.background ? 1 : 4}
              className={
                c.background
                  ? `w-full resize-none overflow-hidden bg-transparent text-center font-bold outline-none placeholder:text-current placeholder:opacity-70 ${backgroundTextSize(c.content.length)}`
                  : `max-h-[40vh] w-full resize-none overflow-y-auto outline-none ${c.content.length <= 85 && !c.hasMedia ? "text-2xl" : "text-base"}`
              }
            />
          </div>
          {hashtags.open && (
            <ComposerHashtagSuggestions options={hashtags.options} highlight={hashtags.highlight} onPick={hashtags.pick} />
          )}

          {/* Bài có ảnh / video thì không dùng màu nền */}
          {!c.hasMedia && (
            <ComposerBackgroundPicker
              backgrounds={backgrounds}
              selectedId={c.background?.id ?? null}
              onSelect={c.chooseBackground}
              disabledReason={c.background ? null : c.backgroundBlockedReason}
            />
          )}

          <ComposerImagePreviews urls={c.imagePreviews} onRemove={c.removeImage} />
          <ComposerVideoPreview
            file={c.video}
            url={c.videoPreview}
            unplayable={c.videoUnplayable}
            onUnplayable={c.markVideoUnplayable}
            onRemove={c.removeVideo}
          />
          {(c.project || projectSearchOpen) && (
            <ComposerProjectPicker
              selected={c.project}
              onSelect={(project) => {
                c.setProject(project);
                setProjectSearchOpen(false);
              }}
              onClose={() => setProjectSearchOpen(false)}
            />
          )}
          <ErrorAlert message={c.error} onClose={c.clearError} className="mt-3" />

          <input ref={c.imageInputRef} type="file" accept="image/*" multiple hidden onChange={c.pickImages} />
          <input ref={c.videoInputRef} type="file" accept={POST_VIDEO_TYPES.join(",")} hidden onChange={c.pickVideo} />

          <ComposerAddBar
            imageCount={c.images.length}
            mediaDisabled={c.background !== null}
            onPickImages={c.openImagePicker}
            onPickVideo={c.openVideoPicker}
            onEmoji={c.insertEmoji}
            onPickProject={() => (c.project ? c.setProject(null) : setProjectSearchOpen((open) => !open))}
            projectActive={c.project !== null || projectSearchOpen}
          />

          <button
            type="button"
            onClick={submit}
            disabled={!c.canSubmit}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Đăng
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
