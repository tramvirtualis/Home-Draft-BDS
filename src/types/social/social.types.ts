// Khớp AuthorResponse bên BE
export interface AuthorResponse {
  id: number;
  fullName: string | null;
  avatarUrl: string | null;
}

// Khớp PostScope bên BE: PUBLIC ai cũng xem, PRIVATE chỉ người đăng xem
export type PostScope = "PUBLIC" | "PRIVATE";

export const POST_SCOPE = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
} as const;

export const POST_SCOPE_LABEL: Record<PostScope, string> = {
  PUBLIC: "Công khai",
  PRIVATE: "Chỉ mình tôi",
};

// Khớp PostBackgroundResponse bên BE: màu nền cho bài chỉ có chữ (giống Facebook)
export interface PostBackground {
  id: number;
  name: string;
  // Giá trị CSS background: mã màu hoặc gradient
  value: string;
  textColor: string;
}

// Khớp AdminPostBackgroundResponse bên BE (trang quản trị)
export interface AdminPostBackground extends PostBackground {
  sortOrder: number;
  active: boolean;
  // Số bài đang dùng; > 0 thì không xóa được, chỉ tắt
  usageCount: number;
  createdAt: string;
}

// Khớp PostBackgroundRequest bên BE
export interface PostBackgroundInput {
  name: string;
  value: string;
  textColor: string;
  active?: boolean;
}

// Khớp PostReportReasonResponse bên BE — lý do báo cáo cho người dùng chọn
export interface PostReportReason {
  id: number;
  name: string;
  description: string | null;
  // Bắt người báo cáo ghi thêm chi tiết (vd lý do "Khác")
  requiresNote: boolean;
}

// Khớp AdminPostReportReasonResponse bên BE
export interface AdminPostReportReason extends PostReportReason {
  sortOrder: number;
  active: boolean;
  // Số báo cáo đã chọn lý do này
  usageCount: number;
  createdAt: string;
  updatedAt: string | null;
}

// Khớp PostReportReasonRequest bên BE
export interface PostReportReasonInput {
  name: string;
  description: string;
  requiresNote: boolean;
  active?: boolean;
}

// Trạng thái báo cáo: chờ xử lý / đã xử lý (ẩn bài) / bỏ qua (không vi phạm)
export type PostReportStatus = "PENDING" | "RESOLVED" | "REJECTED";

// Khớp AdminReportedPostResponse bên BE — một bài bị báo cáo, gom các báo cáo cùng trạng thái
export interface AdminReportedPost {
  post: AdminPost | null;
  status: PostReportStatus;
  reportCount: number;
  lastReportedAt: string | null;
  // Số báo cáo theo từng lý do, nhiều nhất trước
  reasons: { name: string; count: number }[];
  handledAt: string | null;
  handledBy: AuthorResponse | null;
  handlerNote: string | null;
}

// Khớp AdminPostReportResponse bên BE — một lượt báo cáo
export interface AdminPostReport {
  id: number;
  reporter: AuthorResponse;
  reason: string | null;
  description: string | null;
  status: PostReportStatus;
  createdAt: string;
  handledAt: string | null;
  handledBy: AuthorResponse | null;
  handlerNote: string | null;
}

// Khớp AdminReportedPostDetailResponse bên BE
export interface AdminReportedPostDetail {
  post: AdminPost;
  reports: AdminPostReport[];
}

// Khớp AdminPostReportStatsResponse bên BE
export interface AdminPostReportStats {
  pending: number;
  resolved: number;
  rejected: number;
}

// Khớp PostResponse bên BE
export interface PostResponse {
  id: number;
  author: AuthorResponse;
  content: string | null;
  imageUrls: string[];
  videoUrl: string | null;
  scope: PostScope;
  createdAt: string;
  // Bài chia sẻ: id bài gốc; null = bài thường
  sharedPostId: number | null;
  // Bài gốc nhúng bên trong; sharedPostId có mà sharedPost null = bài gốc đã bị ẩn / chuyển riêng tư
  sharedPost: PostResponse | null;
  shareCount: number;
  // Màu nền của bài chỉ có chữ; null = bài thường
  background: PostBackground | null;
  // Dự án được gắn vào bài; null = không gắn hoặc dự án đã bị ẩn
  project: PostProject | null;
}

// Khớp PostProjectResponse bên BE: thẻ dự án dưới nội dung bài, cũng là kết quả ô "Gắn dự án"
export interface PostProject {
  id: number;
  name: string;
  location: string | null;
  imageUrl: string | null;
}

// Khớp HashtagResponse bên BE: tag không kèm "#"
export interface Hashtag {
  tag: string;
  postCount: number;
}

// Khớp FollowStatsResponse bên BE
export interface FollowStats {
  userId: number;
  followerCount: number;
  followingCount: number;
  // Người đang đăng nhập có theo dõi userId không (khách: luôn false)
  following: boolean;
}

// Khớp FollowResponse bên BE: một dòng trong danh sách đang theo dõi
export interface FollowResponse {
  userId: number;
  fullName: string | null;
  avatarUrl: string | null;
  followedAt: string;
  followerCount: number;
  // Người này có đang theo dõi lại người đang đăng nhập không
  followsMe: boolean;
}

// Dòng trên giao diện: following = false khi vừa bỏ theo dõi, dòng vẫn ở lại để theo dõi lại được
export interface FollowingUser extends FollowResponse {
  following: boolean;
}

// Bộ lọc bảng tin GET /posts — dùng một điều kiện, khớp PostFeedFilter bên BE
export interface PostQuery {
  userId?: number;
  hashtag?: string;
  projectId?: number;
}

// Khớp PostShareRequest bên BE
export interface SharePostRequest {
  content?: string;
  scope?: PostScope;
}

// Khớp AdminPostResponse bên BE (trang quản trị): thêm trạng thái ẩn/hiện
export interface AdminPost extends Omit<PostResponse, "sharedPost" | "shareCount" | "background" | "project"> {
  active: boolean;
  // Ảnh kèm id để trang sửa biết ảnh nào cần xóa
  images: AdminPostImage[];
}

// Khớp AdminPostImageResponse bên BE
export interface AdminPostImage {
  id: number;
  imageUrl: string;
}

// Khớp AdminPostStatsResponse bên BE
export interface AdminPostStats {
  all: number;
  publicPosts: number;
  privatePosts: number;
  hidden: number;
}

// Khớp CommentResponse bên BE
export interface CommentResponse {
  id: number;
  postId: number;
  parentId: number | null;
  author: AuthorResponse;
  content: string;
  replyCount: number;
  createdAt: string;
}

// Khớp CommentCreateRequest bên BE
export interface CreateCommentRequest {
  postId: number;
  parentId?: number | null;
  content: string;
}

// Khớp PostReactionResponse bên BE
export interface PostReactionResponse {
  postId: number;
  likeCount: number;
  liked: boolean;
}

export interface CreatePostRequest {
  content?: string;
  images?: File[];
  video?: File | null;
  scope?: PostScope;
  // Màu nền (chỉ cho bài chỉ có chữ, không kèm ảnh / video)
  backgroundId?: number | null;
  // Dự án gắn vào bài
  projectId?: number | null;
}

export interface SocialUser {
  id: number;
  fullName: string;
  avatarUrl?: string | null;
}

export interface SocialComment {
  id: number;
  parentId: number | null;
  user: SocialUser;
  content: string;
  replyCount: number;
  createdAt: string;
}

// Dạng bài viết mà UI hiển thị (đã gắn thông tin người đăng)
export interface SocialPost {
  id: number;
  user: SocialUser;
  content: string;
  imageUrls: string[];
  videoUrl: string | null;
  scope: PostScope;
  createdAt: string;
  sharedPostId: number | null;
  sharedPost: SocialPost | null;
  shareCount: number;
  background: PostBackground | null;
  project: PostProject | null;
}

export const toSocialUser = (author: AuthorResponse): SocialUser => ({
  id: author.id,
  fullName: author.fullName ?? "Người dùng",
  avatarUrl: author.avatarUrl,
});

export const toSocialPost = (post: PostResponse): SocialPost => ({
  id: post.id,
  user: toSocialUser(post.author),
  content: post.content ?? "",
  imageUrls: post.imageUrls,
  videoUrl: post.videoUrl,
  scope: post.scope,
  createdAt: post.createdAt,
  sharedPostId: post.sharedPostId,
  sharedPost: post.sharedPost && toSocialPost(post.sharedPost),
  shareCount: post.shareCount,
  background: post.background,
  project: post.project,
});

export const toSocialComment = (c: CommentResponse): SocialComment => ({
  id: c.id,
  parentId: c.parentId,
  user: toSocialUser(c.author),
  content: c.content,
  replyCount: c.replyCount,
  createdAt: c.createdAt,
});

// Giới hạn khớp PostServiceImpl / CommentServiceImpl bên BE
export const POST_MAX_IMAGES = 10;
export const POST_MAX_CONTENT_LENGTH = 5000;
export const COMMENT_MAX_CONTENT_LENGTH = 500;
// Bài có màu nền: chữ to giữa khung nên giới hạn ngắn (khớp MAX_BACKGROUND_CONTENT_LENGTH bên BE)
export const POST_BACKGROUND_MAX_CONTENT_LENGTH = 130;
// Tạm tắt đăng video (ẩn nút thêm video ở trang người dùng và admin); bật lại thì đổi thành true
export const POST_VIDEO_ENABLED = false;
// Khớp CloudinaryServiceImpl.uploadVideo bên BE
export const POST_MAX_VIDEO_SIZE = 50 * 1024 * 1024;
export const POST_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
