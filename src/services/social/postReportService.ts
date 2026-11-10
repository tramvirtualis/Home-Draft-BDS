import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type {
  AdminPostReportReason,
  AdminPostReportStats,
  AdminReportedPost,
  AdminReportedPostDetail,
  PostReportReason,
  PostReportReasonInput,
  PostReportStatus,
} from "../../types/social/social.types";

export interface AdminPostReportReasonStats {
  total: number;
  active: number;
}

// GET /post-report-reasons — lý do báo cáo đang hiện, khách cũng xem được
class PostReportReasonService extends BaseService {
  constructor() {
    super("/post-report-reasons", { auth: false });
  }

  list(): Promise<PostReportReason[]> {
    return this.getList<PostReportReason>();
  }
}

// POST /posts/{id}/reports (JSON: reasonId, description?) — báo cáo bài viết, cần đăng nhập
class PostReportService extends BaseService {
  constructor() {
    super("/posts");
  }

  async report(postId: number, reasonId: number, description: string): Promise<void> {
    await this.http.post(this.url(postId, "reports"), {
      reasonId,
      description: description.trim() || undefined,
    });
  }
}

/**
 API quản trị lý do báo cáo: /api/admin/post-report-reasons (quyền POST_VIEW / POST_MANAGE).
 - GET ?page=&size=: kể cả đang ẩn, theo thứ tự hiển thị, kèm số báo cáo đã dùng; GET /stats: tổng / đang hiện
 - POST / PUT /{id} (JSON: name, description, requiresNote, active)
 - PATCH /{id}/active, PATCH /{id}/move (UP | DOWN). Không có xóa, chỉ ẩn.
 */
class AdminPostReportReasonService extends BaseService {
  constructor() {
    super("/admin/post-report-reasons");
  }

  async list(page = 0, size = 10): Promise<PageResponse<AdminPostReportReason>> {
    return toPage(await this.getPage<AdminPostReportReason>({ page, size }));
  }

  stats(): Promise<AdminPostReportReasonStats> {
    return this.http.get<AdminPostReportReasonStats>(this.url("stats"));
  }

  createReason(input: PostReportReasonInput): Promise<AdminPostReportReason> {
    return this.create<AdminPostReportReason>(input);
  }

  updateReason(id: number, input: PostReportReasonInput): Promise<AdminPostReportReason> {
    return this.update<AdminPostReportReason>(id, input);
  }

  setActive(id: number, active: boolean): Promise<AdminPostReportReason> {
    return this.http.patch<AdminPostReportReason>(this.url(id, "active"), { active });
  }

  // Đổi chỗ với lý do đứng ngay trước (UP) / ngay sau (DOWN), kể cả khi lý do đó ở trang khác
  async move(id: number, direction: "UP" | "DOWN"): Promise<void> {
    await this.http.patch(this.url(id, "move"), { direction });
  }
}

/**
 API duyệt báo cáo: /api/admin/post-reports (quyền POST_VIEW / POST_MANAGE).
 - GET ?status=&page=&size=: mỗi dòng là một bài bị báo cáo; GET /stats: số bài theo từng nhóm
 - GET /posts/{postId}: bài + mọi lượt báo cáo; PATCH /posts/{postId}/resolve (JSON: action HIDE | DISMISS, note?)
 */
class AdminPostReportService extends BaseService {
  constructor() {
    super("/admin/post-reports");
  }

  async list(status: PostReportStatus, page = 0, size = 10): Promise<PageResponse<AdminReportedPost>> {
    return toPage(await this.getPage<AdminReportedPost>({ status, page, size }));
  }

  stats(): Promise<AdminPostReportStats> {
    return this.http.get<AdminPostReportStats>(this.url("stats"));
  }

  detail(postId: number): Promise<AdminReportedPostDetail> {
    return this.http.get<AdminReportedPostDetail>(this.url("posts", postId));
  }

  // HIDE: ẩn bài vi phạm; DISMISS: bỏ qua, giữ nguyên bài
  async resolve(postId: number, action: "HIDE" | "DISMISS", note: string): Promise<void> {
    await this.http.patch(this.url("posts", postId, "resolve"), { action, note: note.trim() || undefined });
  }
}

export const postReportReasonService = new PostReportReasonService();
export const adminPostReportService = new AdminPostReportService();
export const postReportService = new PostReportService();
export const adminPostReportReasonService = new AdminPostReportReasonService();
