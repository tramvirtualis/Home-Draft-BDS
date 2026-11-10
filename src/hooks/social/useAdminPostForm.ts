import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { EMPTY_MEDIA_CHANGE, isMediaChanged, type PostMediaChange } from "../../components/Admin/posts/PostMediaEditor";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminPostService } from "../../services/social/adminPostService";
import { selectCurrentUser, useAppSelector } from "../../store";
import { toSocialUser, type AdminPost, type PostScope, type SocialUser } from "../../types/social/social.types";
import { isRichTextEmpty, postToEditorHtml } from "../../utils/richText";
import useUnsavedChangesGuard from "../useUnsavedChangesGuard";

type Load = { status: "loading" } | { status: "error" } | { status: "ready"; post: AdminPost };

const NEW_POST_SCOPE: PostScope = "PUBLIC";

// Tải bài cần sửa cho trang /admin/posts/:id/edit; tạo bài mới thì không tải gì
export function useAdminPostDetail(isNew: boolean, postId: number) {
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (isNew || !Number.isFinite(postId)) return;
    let cancelled = false;
    adminPostService
      .get(postId)
      .then((post) => !cancelled && setLoad({ status: "ready", post }))
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [isNew, postId]);

  // Lưu xong vẫn ở lại trang: nạp bài vừa lưu và dựng lại form (key đổi) để xóa trạng thái "chưa lưu"
  const handleSaved = (saved: AdminPost) => {
    setLoad({ status: "ready", post: saved });
    setSavedCount((n) => n + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { load, savedCount, handleSaved };
}

// Form tạo / sửa bài. post = null: tạo bài mới (admin đăng dưới tên tài khoản của mình)
export function useAdminPostForm(post: AdminPost | null, onSaved?: (saved: AdminPost) => void) {
  const toast = useToast();
  const navigate = useNavigate();
  const me = useAppSelector(selectCurrentUser);
  const initialContent = useMemo(() => (post ? postToEditorHtml(post.content) : ""), [post]);
  const initialScope = post?.scope ?? NEW_POST_SCOPE;
  const initialActive = post?.active ?? true;
  const savedImages = post?.images ?? [];
  const savedVideoUrl = post?.videoUrl ?? null;
  // Giờ đăng hiện ở khung xem trước khi tạo bài mới
  const [draftCreatedAt] = useState(() => new Date().toISOString());

  const [content, setContent] = useState(initialContent);
  const [scope, setScope] = useState<PostScope>(initialScope);
  const [active, setActive] = useState(initialActive);
  const [media, setMedia] = useState<PostMediaChange>(EMPTY_MEDIA_CHANGE);
  const [saving, setSaving] = useState(false);

  const name = post?.author?.fullName ?? "Người dùng";
  const author: SocialUser = post
    ? toSocialUser(post.author)
    : { id: me?.id ?? 0, fullName: me?.fullName ?? "Quản trị viên", avatarUrl: me?.avatarUrl };
  const dirty = content !== initialContent || scope !== initialScope || active !== initialActive || isMediaChanged(media);

  // Còn thay đổi chưa lưu mà reload / đóng tab / bấm link khác thì hỏi lại
  const guard = useUnsavedChangesGuard(dirty);

  const imagesAfter = savedImages.length - media.removedImageIds.length + media.newImages.length;
  const hasVideoAfter = media.newVideo !== null || (!media.removeVideo && savedVideoUrl !== null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    // Sau khi sửa bài vẫn phải có nội dung chữ, ảnh hoặc video
    if (isRichTextEmpty(content) && imagesAfter === 0 && !hasVideoAfter) {
      toast.show("Bài viết phải có nội dung, ảnh hoặc video", "error");
      return;
    }
    setSaving(true);
    const input = {
      content: isRichTextEmpty(content) ? "" : content,
      scope,
      active,
      removeImageIds: media.removedImageIds,
      newImages: media.newImages.map((n) => n.file),
      newVideo: media.newVideo?.file ?? null,
      removeVideo: media.removeVideo,
    };
    try {
      if (!post) {
        await adminPostService.createPost(input);
        toast.show("Đã đăng bài viết");
        // Đăng xong về danh sách: bỏ chặn "chưa lưu" trước khi chuyển trang
        guard.allowLeave();
        navigate("/admin/posts");
        return;
      }
      const saved = await adminPostService.edit(post.id, input);
      toast.show("Đã lưu thay đổi bài viết");
      onSaved?.(saved);
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
      setSaving(false);
    }
  };

  const notifyError = (message: string) => toast.show(message, "error");

  return {
    content,
    setContent,
    scope,
    setScope,
    active,
    setActive,
    media,
    setMedia,
    saving,
    savedImages,
    savedVideoUrl,
    draftCreatedAt,
    name,
    author,
    dirty,
    guard,
    submit,
    notifyError,
  };
}
