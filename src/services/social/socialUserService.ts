import BaseService from "../base/BaseService";
import { authHttp } from "../../api";
import type { AuthorResponse } from "../../types/social/social.types";

// GET /social/users/search — tìm người dùng theo tên cho ô tìm kiếm trang Cộng đồng, khách cũng dùng được
class SocialUserService extends BaseService {
  constructor() {
    super("/social/users", { auth: false });
  }

  search(keyword: string, size = 8): Promise<AuthorResponse[]> {
    return this.getList<AuthorResponse>({ keyword, size }, "search");
  }

  // GET /social/users/{id}/profile — tên + ảnh đại diện để hiện đầu trang cá nhân
  getProfile(id: number): Promise<AuthorResponse> {
    return this.http.get<AuthorResponse>(this.url(id, "profile"));
  }

  // GET /social/users/suggestions — người đăng nhiều bài mà mình chưa theo dõi (cần đăng nhập)
  async suggestions(size = 5): Promise<AuthorResponse[]> {
    return (await authHttp.get<AuthorResponse[] | null>(this.url("suggestions"), { params: { size } })) ?? [];
  }
}

const socialUserService = new SocialUserService();
export default socialUserService;
