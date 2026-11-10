import BaseService from "../base/BaseService";
import type { PostProject } from "../../types/social/social.types";

// GET /social/projects/search — ô "Gắn dự án" khi đăng bài, chỉ trả dự án đang hiển thị
class SocialProjectService extends BaseService {
  constructor() {
    super("/social/projects", { auth: false });
  }

  search(keyword: string, size = 6): Promise<PostProject[]> {
    return this.getList<PostProject>({ keyword, size }, "search");
  }
}

const socialProjectService = new SocialProjectService();
export default socialProjectService;
