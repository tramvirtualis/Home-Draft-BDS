import BaseService from "../base/BaseService";
import { cleanParams } from "../../api";
import type { CursorPage } from "../../types/common.types";
import type { FollowResponse, FollowStats } from "../../types/social/social.types";

// Theo dõi người dùng (một chiều, giống Instagram). Dùng authHttp: có token thì BE trả đúng "tôi có theo dõi không"
class FollowService extends BaseService {
  constructor() {
    super("/follows");
  }

  // GET /follows/{userId}/stats — số người theo dõi / đang theo dõi; khách cũng xem được
  getStats(userId: number): Promise<FollowStats> {
    return this.http.get<FollowStats>(this.url(userId, "stats"));
  }

  // GET /follows/{userId}/following?cursor=&size= — những người userId đang theo dõi, mới theo dõi trước (cần đăng nhập)
  getFollowing(userId: number, cursor: number | null = null, size = 20): Promise<CursorPage<FollowResponse>> {
    return this.http.get<CursorPage<FollowResponse>>(this.url(userId, "following"), {
      params: cleanParams({ cursor, size }),
    });
  }

  // POST /follows/{userId} — bật/tắt theo dõi (cần đăng nhập)
  toggle(userId: number): Promise<FollowStats> {
    return this.http.post<FollowStats>(this.url(userId), undefined, { silentLoading: true });
  }
}

const followService = new FollowService();
export default followService;
