import type { ReactNode } from "react";
import { X } from "lucide-react";
import CommentInput from "./CommentInput";
import CommentList from "./CommentList";
import PostActions from "../PostActions";
import PostBackgroundText from "../post/PostBackgroundText";
import PostContent from "../post/PostContent";
import PostHeader from "../post/PostHeader";
import PostMenu from "../post/PostMenu";
import PostProjectCard from "../post/PostProjectCard";
import PostVideo from "../post/PostVideo";
import SharedPostEmbed from "../post/SharedPostEmbed";
import { useCommentForm } from "../../../hooks/social/useCommentForm";
import type { PostCommentsState } from "../../../hooks/social/usePostComments";
import type { SocialPost, SocialUser } from "../../../types/social/social.types";

type Props = {
  post: SocialPost;
  currentUser: SocialUser | null;
  liked: boolean;
  likeCount: number;
  onToggleLike: () => void;
  thread: PostCommentsState;
  /** Có thì hiện nút đóng ở góc phải tiêu đề */
  onClose?: () => void;
  /** Ảnh hiện ngay trong phần cuộn, chỉ trên điện thoại (máy tính/tablet ảnh nằm bên trái) */
  mobileMedia?: ReactNode;
};

// Phần bên phải modal (hoặc cả modal nếu bài không có ảnh): nội dung + bình luận + ô nhập
export default function PostDetailPanel({
  post,
  currentUser,
  liked,
  likeCount,
  onToggleLike,
  thread,
  onClose,
  mobileMedia,
}: Props) {
  const form = useCommentForm(thread.addComment);

  return (
    <>
      <header className="relative border-b border-gray-200 py-3 text-center">
        <h2 className="text-lg font-bold">Bài viết của {post.user.fullName}</h2>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Đóng"
            className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 p-1.5 hover:bg-gray-200 ${mobileMedia ? "md:hidden" : ""}`}
          >
            <X size={20} />
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <PostHeader
          user={post.user}
          createdAt={post.createdAt}
          scope={post.scope}
          action={post.sharedPostId !== null ? "đã chia sẻ một bài viết" : undefined}
          end={<PostMenu postId={post.id} isOwner={currentUser?.id === post.user.id} isGuest={currentUser === null} />}
        />
        {post.background ? (
          <PostBackgroundText background={post.background} content={post.content} />
        ) : (
          <PostContent content={post.content} collapsible={false} />
        )}
        <PostProjectCard project={post.project} />
        <PostVideo src={post.videoUrl} maxHeight="max-h-80" />
        {post.sharedPostId !== null && <SharedPostEmbed post={post.sharedPost} collapsible={false} />}
        {mobileMedia && <div className="-mx-4 mb-3 md:hidden">{mobileMedia}</div>}

        <div className="mb-4">
          <PostActions
            likeCount={likeCount}
            commentCount={thread.total}
            liked={liked}
            onToggleLike={onToggleLike}
          />
        </div>

        <CommentList thread={thread} onReply={form.startReply} />
      </div>

      <CommentInput currentUser={currentUser} form={form} />
    </>
  );
}
