import BaseService from "../base/BaseService";
import { cleanParams } from "../../api";
import type { CursorPage } from "../../types/common.types";
import type { CommentResponse, CreateCommentRequest } from "../../types/social/social.types";

// Khách đọc được bình luận; viết bình luận cần đăng nhập → dùng authHttp (mặc định của BaseService)
class CommentService extends BaseService {
  constructor() {
    super("/comments");
  }

  // GET /comments/post/{postId}?cursor=&size= — bình luận gốc, cũ nhất trước; lần tải đầu có kèm total
  getCommentsByPost(postId: number, cursor: number | null = null, size = 10): Promise<CursorPage<CommentResponse>> {
    return this.http.get<CursorPage<CommentResponse>>(this.url("post", postId), {
      params: cleanParams({ cursor, size }),
    });
  }

  // GET /comments/{commentId}/replies?cursor=&size=
  getReplies(commentId: number, cursor: number | null = null, size = 10): Promise<CursorPage<CommentResponse>> {
    return this.http.get<CursorPage<CommentResponse>>(this.url(commentId, "replies"), {
      params: cleanParams({ cursor, size }),
    });
  }

  // POST /comments — có parentId là trả lời bình luận
  async createComment(request: CreateCommentRequest): Promise<CommentResponse> {
    // Ô bình luận tự hiện trạng thái gửi → không bật lớp loading toàn màn hình
    return this.http.post<CommentResponse>(this.url(), request, { silentLoading: true });
  }
}

const commentService = new CommentService();
export default commentService;
