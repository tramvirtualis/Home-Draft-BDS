import BaseService from "../base/BaseService";
import { authHttp, toPage } from "../../api/http";
import { EVENT_SORT_PARAM } from "../../types/event/event.types";
import type {
  CommentEventRequest,
  Event,
  EventComment,
  EventFilter,
  EventMember,
  EventSort,
  PageResponse,
} from "../../types/event/event.types";

export interface GetEventsParams {
  filter: EventFilter;
  sort: EventSort;
  page: number;
  size: number;
}

const withImages = (event: Event): Event => ({
  ...event,
  images: event.images ?? [],
});

/**
 Đọc (danh sách, chi tiết, bình luận) dùng publicHttp → khách vẫn xem được.
 Ghi (tham gia, bình luận, thành viên) dùng authHttp → gắn token, 401 tự refresh.
 Tạo / sửa / xóa sự kiện và ảnh chỉ ở trang quản trị (adminEventService).
 */
class EventService extends BaseService {
  private readonly authed = authHttp;

  constructor() {
    super("/events", { auth: false });
  }

  // SỰ KIỆN
  // GET /events?keyword=&status=&page=&size=&sort=
  async getEvents({
    filter,
    sort,
    page,
    size,
  }: GetEventsParams): Promise<PageResponse<Event>> {
    const res = await this.getPage<Event>({
      keyword: filter.keyword.trim(),
      status: filter.status,
      page,
      size,
      sort: EVENT_SORT_PARAM[sort],
    });
    return toPage(res);
  }

  // Sự kiện mới đăng cho sidebar trang Cộng đồng
  async getLatestEvents(limit = 5): Promise<Event[]> {
    const page = await this.getEvents({
      filter: { keyword: "", status: "" },
      sort: "NEWEST",
      page: 0,
      size: limit,
    });
    return page.content.map(withImages);
  }

  // GET /events/{id}
  async getEventById(id: number): Promise<Event> {
    return withImages(await this.getById<Event>(id));
  }

  // THÀNH VIÊN
  // POST /events/{id}/join
  async joinEvent(id: number): Promise<EventMember> {
    return this.authed.post<EventMember>(this.url(id, "join"));
  }

  // DELETE /events/{id}/join
  async leaveEvent(id: number): Promise<void> {
    await this.authed.delete(this.url(id, "join"));
  }

  // GET /events/{id}/members
  async getMembers(id: number): Promise<EventMember[]> {
    return (
      (await this.authed.get<EventMember[] | null>(this.url(id, "members"))) ??
      []
    );
  }

  //  BÌNH LUẬN
  // GET /events/{id}/comments
  async getComments(
    eventId: number,
    page = 0,
    size = 10
  ): Promise<PageResponse<EventComment>> {
    const res = await this.getPage<EventComment>(
      { page, size, sort: "createdAt,desc" },
      `${eventId}/comments`
    );
    return toPage(res);
  }

  // POST /events/{id}/comments
  async addComment(
    eventId: number,
    request: CommentEventRequest
  ): Promise<EventComment> {
    return this.authed.post<EventComment>(
      this.url(eventId, "comments"),
      request,
      { silentLoading: true }
    );
  }

  // DELETE /events/{id}/comments/{commentId}
  async deleteComment(eventId: number, commentId: number): Promise<void> {
    await this.authed.delete(this.url(eventId, "comments", commentId));
  }
}

const eventService = new EventService();
export default eventService;
