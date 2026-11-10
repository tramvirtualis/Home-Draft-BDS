import BaseService from "../base/BaseService";
import type { Hashtag } from "../../types/social/social.types";

// Hashtag trong bài viết Cộng đồng, khách cũng xem được
class HashtagService extends BaseService {
  constructor() {
    super("/hashtags", { auth: false });
  }

  // GET /hashtags/trending — nhiều bài nhất trong days ngày gần đây
  trending(size = 5, days = 30): Promise<Hashtag[]> {
    return this.getList<Hashtag>({ size, days }, "trending");
  }

  // GET /hashtags/suggest — gợi ý khi đang gõ "#keyword"
  suggest(keyword: string, size = 6): Promise<Hashtag[]> {
    return this.getList<Hashtag>({ keyword, size }, "suggest");
  }
}

const hashtagService = new HashtagService();
export default hashtagService;
