import BaseService from "../base/BaseService";
import { cleanParams } from "../../api";
import { compressImage } from "../../utils/compressImage";
import { uploadDirect } from "../upload/uploadService";
import type { CursorPage } from "../../types/common.types";
import type {
  CreatePostRequest,
  PostReactionResponse,
  PostResponse,
  PostQuery,
  PostScope,
  SharePostRequest,
} from "../../types/social/social.types";

const withImages = (post: PostResponse): PostResponse => ({
  ...post,
  imageUrls: post.imageUrls ?? [],
  videoUrl: post.videoUrl ?? null,
  scope: post.scope ?? "PUBLIC",
  sharedPostId: post.sharedPostId ?? null,
  sharedPost: post.sharedPost ? withImages(post.sharedPost) : null,
  shareCount: post.shareCount ?? 0,
  background: post.background ?? null,
  project: post.project ?? null,
});

// Khách đọc được bài viết / lượt thích; vẫn dùng authHttp để có token thì BE trả đúng "tôi đã thích chưa"
class PostService extends BaseService {
  constructor() {
    super("/posts");
  }

  // GET /posts?cursor=&size=&userId=&hashtag=&projectId= (mới nhất trước); không lọc = bảng tin chung
  async getPosts(cursor: number | null = null, size = 10, query: PostQuery = {}): Promise<CursorPage<PostResponse>> {
    const res = await this.http.get<CursorPage<PostResponse>>(this.url(), {
      params: cleanParams({ cursor, size, ...query }),
    });
    return { ...res, items: res.items.map(withImages) };
  }

  // GET /posts/{id}
  async getPost(id: number): Promise<PostResponse> {
    return withImages(await this.getById<PostResponse>(id));
  }

  // Ảnh / video upload thẳng lên Object Storage (không qua Cloudflare / BE), rồi POST /posts (JSON) chỉ gửi link
  // — cần ít nhất nội dung, 1 ảnh hoặc video. onProgress: tiến độ gửi file tính theo tổng dung lượng ảnh + video (0 → 1),
  // báo 1 khi gửi xong hết file (bài chỉ có chữ thì báo 1 luôn) để thẻ bài chuyển sang "Đang xử lý"
  async createPost(
    { content, images = [], video, scope = "PUBLIC", backgroundId }: CreatePostRequest,
    onProgress?: (ratio: number) => void
  ): Promise<PostResponse> {
    const compressed = await Promise.all(images.map((file) => compressImage(file)));
    const files = video ? [...compressed, video] : compressed;
    const total = files.reduce((sum, file) => sum + file.size, 0);
    const loaded = files.map(() => 0);
    const track = (i: number) => (ratio: number) => {
      loaded[i] = ratio * files[i].size;
      if (total > 0) onProgress?.(Math.min(loaded.reduce((sum, n) => sum + n, 0) / total, 0.999));
    };

    const [imageUrls, videoUrl] = await Promise.all([
      Promise.all(compressed.map((file, i) => uploadDirect(file, "POST_IMAGE", track(i)))),
      video ? uploadDirect(video, "POST_VIDEO", track(compressed.length)) : Promise.resolve(undefined),
    ]);
    onProgress?.(1);
    return withImages(
      // silentLoading: thẻ bài đang đăng đã có thanh tiến trình, không bật loader toàn trang
      await this.http.post<PostResponse>(
        this.url(),
        {
          content: content?.trim() || undefined,
          imageUrls,
          videoUrl,
          scope,
          backgroundId: backgroundId ?? undefined,
        },
        { silentLoading: true }
      )
    );
  }

  // POST /posts/{id}/share (JSON: content, scope) — tạo bài chia sẻ nhúng bài gốc, giống Facebook
  async sharePost(postId: number, { content, scope = "PUBLIC" }: SharePostRequest): Promise<PostResponse> {
    const text = content?.trim();
    return withImages(await this.http.post<PostResponse>(this.url(postId, "share"), { content: text || undefined, scope }));
  }

  // PATCH /posts/{id}/scope — chỉ người đăng đổi được phạm vi bài của mình
  async updateScope(postId: number, scope: PostScope): Promise<PostResponse> {
    return withImages(await this.http.patch<PostResponse>(this.url(postId, "scope"), { scope }));
  }

  // DELETE /posts/{id} — người đăng xóa bài của mình (BE chuyển is_active = false, không ai thấy nữa)
  async deletePost(postId: number): Promise<void> {
    await this.http.delete(this.url(postId));
  }

  // GET /posts/{id}/reactions — tổng lượt thích + tôi đã thích chưa
  async getReaction(postId: number): Promise<PostReactionResponse> {
    return this.http.get<PostReactionResponse>(this.url(postId, "reactions"));
  }

  // POST /posts/{id}/reactions — bật/tắt thích
  async toggleLike(postId: number): Promise<PostReactionResponse> {
    return this.http.post<PostReactionResponse>(this.url(postId, "reactions"), undefined, { silentLoading: true });
  }
}

const postService = new PostService();
export default postService;
