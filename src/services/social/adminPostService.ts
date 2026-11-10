import BaseService from "../base/BaseService";
import { authHttp, toPage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type { AdminPost, AdminPostStats, PostScope } from "../../types/social/social.types";
import { uploadDirect, uploadImages } from "../upload/uploadService";

export interface AdminPostQuery {
  keyword?: string;
  scope?: PostScope | null;
  active?: boolean | null; // null/undefined = cả ẩn lẫn hiện
  from?: string; // yyyy-MM-dd
  to?: string; // yyyy-MM-dd
  page: number;
  size: number;
}

export interface AdminPostInput {
  content: string; // HTML từ trình soạn thảo
  scope: PostScope;
  active: boolean;
  removeImageIds: number[];
  newImages: File[];
  newVideo: File | null; // có file thì thay video cũ
  removeVideo: boolean; // true: gỡ video hiện có
}

// Video tối đa 20MB nên cho chờ lâu hơn mặc định
const EDIT_CONFIG = { timeout: 180000 };

const withMedia = (p: AdminPost): AdminPost => ({ ...p, imageUrls: p.imageUrls ?? [], images: p.images ?? [] });

// Ảnh / video mới upload thẳng lên Object Storage (song song), chỉ gửi link imageUrls / videoUrl
const appendNewMedia = async (form: FormData, input: AdminPostInput): Promise<void> => {
  const [imageUrls, videoUrl] = await Promise.all([
    uploadImages(input.newImages, "POST_IMAGE"),
    input.newVideo ? uploadDirect(input.newVideo, "POST_VIDEO") : Promise.resolve(null),
  ]);
  imageUrls.forEach((url) => form.append("imageUrls", url));
  if (videoUrl) form.append("videoUrl", videoUrl);
};

/**
 API quản trị bài đăng cộng đồng: /api/admin/posts (chỉ ADMIN, gắn token, 401 tự refresh).
 - Danh sách lọc ở server: keyword (nội dung / tên người đăng), scope, active, from, to, page, size.
 - Ẩn/hiện bài: PATCH /{id}/active. Thẻ đếm: GET /stats. Đăng bài mới: POST (multipart).
 */
class AdminPostService extends BaseService {
  constructor() {
    super("/admin/posts");
  }

  async search(query: AdminPostQuery): Promise<PageResponse<AdminPost>> {
    const res = await this.getPage<AdminPost>({
      keyword: query.keyword?.trim(),
      scope: query.scope ?? undefined,
      active: query.active ?? undefined,
      from: query.from || undefined,
      to: query.to || undefined,
      page: query.page,
      size: query.size,
      sort: "createdAt,desc",
    });
    const p = toPage(res);
    return { ...p, content: p.content.map(withMedia) };
  }

  stats(): Promise<AdminPostStats> {
    return this.http.get<AdminPostStats>(this.url("stats"));
  }

  async get(id: number): Promise<AdminPost> {
    return withMedia(await this.getById<AdminPost>(id));
  }

  // POST /admin/posts (multipart: content, scope, active, imageUrls, videoUrl) — admin đăng bài dưới tên tài khoản của mình
  async createPost(input: AdminPostInput): Promise<AdminPost> {
    const form = new FormData();
    form.append("content", input.content);
    form.append("scope", input.scope);
    form.append("active", String(input.active));
    await appendNewMedia(form, input);
    return withMedia(await authHttp.post<AdminPost>(this.url(), form, EDIT_CONFIG));
  }

  // PUT /admin/posts/{id} (multipart): sửa chữ, phạm vi, ảnh và video trong một lần để lưu nguyên khối
  async edit(id: number, input: AdminPostInput): Promise<AdminPost> {
    const form = new FormData();
    form.append("content", input.content);
    form.append("scope", input.scope);
    form.append("active", String(input.active));
    input.removeImageIds.forEach((imageId) => form.append("removeImageIds", String(imageId)));
    await appendNewMedia(form, input);
    form.append("removeVideo", String(input.removeVideo));
    return withMedia(await authHttp.put<AdminPost>(this.url(id), form, EDIT_CONFIG));
  }

  setActive(id: number, active: boolean): Promise<AdminPost> {
    return authHttp.patch<AdminPost>(this.url(id, "active"), { active });
  }
}

export const adminPostService = new AdminPostService();
