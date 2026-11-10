import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../../components/common/toastContext";
import socialUserService from "../../services/social/socialUserService";
import { selectAuthStatus, selectCurrentUser, useAppSelector } from "../../store";
import { toSocialPost, toSocialUser, type PostQuery, type SocialUser } from "../../types/social/social.types";
import { useInfiniteScroll } from "./useInfiniteScroll";
import { usePostUploads } from "./usePostUploads";
import { usePosts } from "./usePosts";

// Bảng tin đang lọc theo gì; đọc từ URL để link hashtag / thông báo mở đúng và nút Back quay lại được:
// ?user=<id> trang cá nhân, ?hashtag=<tag>, ?project=<id>, ?feed=following; không có = bảng tin chung
export type FeedFilter =
  | { type: "all" }
  | { type: "user"; userId: number }
  | { type: "hashtag"; tag: string }
  | { type: "project"; projectId: number }
  | { type: "following" };

const FEED_PARAMS = ["user", "hashtag", "project", "feed", "post"];

const positiveId = (value: string | null) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

function readFilter(params: URLSearchParams): FeedFilter {
  const userId = positiveId(params.get("user"));
  if (userId) return { type: "user", userId };
  const tag = params.get("hashtag")?.trim().replace(/^#/, "").toLowerCase();
  if (tag) return { type: "hashtag", tag };
  const projectId = positiveId(params.get("project"));
  if (projectId) return { type: "project", projectId };
  if (params.get("feed") === "following") return { type: "following" };
  return { type: "all" };
}

function toQuery(filter: FeedFilter): PostQuery {
  switch (filter.type) {
    case "user":
      return { userId: filter.userId };
    case "hashtag":
      return { hashtag: filter.tag };
    case "project":
      return { projectId: filter.projectId };
    default:
      return {};
  }
}

// Dữ liệu cho trang Cộng đồng: người đang đăng nhập (null = khách), bảng tin (cuộn vô hạn, có bộ lọc), menu đang chọn
export function useSocialFeed() {
  const authStatus = useAppSelector(selectAuthStatus);
  const authUser = useAppSelector(selectCurrentUser);
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const filter = useMemo(() => readFilter(params), [params]);
  // Mục "Đang theo dõi" hiện danh sách người, không hiện bài nên không cần tải bảng tin
  const feed = usePosts(toQuery(filter), 10, filter.type !== "following");
  const uploads = usePostUploads(feed.createPost);
  const sentinelRef = useInfiniteScroll(feed.loadMore, feed.hasMore);

  const currentUser = useMemo<SocialUser | null>(
    () =>
      authUser && {
        id: authUser.id,
        fullName: authUser.fullName,
        avatarUrl: authUser.avatarUrl,
      },
    [authUser],
  );

  // Biết chắc là khách hay đã có GET /users/me thì mới vẽ trang, tránh nháy giao diện khách
  const authReady =
    authStatus === "unauthenticated" || (authStatus === "authenticated" && currentUser !== null);

  const posts = useMemo(() => feed.posts.map(toSocialPost), [feed.posts]);

  // Người đang được xem trang cá nhân: bấm từ bài viết thì đã có sẵn, mở bằng link thì tải tên + ảnh
  const [knownUser, setKnownUser] = useState<SocialUser | null>(null);
  const viewUserId = filter.type === "user" ? filter.userId : null;
  const viewUser =
    viewUserId === null
      ? null
      : viewUserId === currentUser?.id
        ? currentUser
        : knownUser?.id === viewUserId
          ? knownUser
          : null;

  // Bộ lọc đổi (bấm menu, bấm hashtag trong bài, nút Back...): trượt mượt lên đầu trang để thấy danh sách mới
  const filterKey = JSON.stringify(filter);
  const firstFilter = useRef(filterKey);
  useEffect(() => {
    if (firstFilter.current === filterKey) return;
    firstFilter.current = filterKey;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }, [filterKey]);

  // Đổi bộ lọc bảng tin: bỏ các bộ lọc cũ (và ?post) rồi đặt bộ lọc mới; push để nút Back quay lại được
  const changeFilter = useCallback(
    (next: Record<string, string> | null) => {
      setParams((prev) => {
        const updated = new URLSearchParams(prev);
        FEED_PARAMS.forEach((key) => updated.delete(key));
        Object.entries(next ?? {}).forEach(([key, value]) => updated.set(key, value));
        return updated;
      });
    },
    [setParams],
  );

  useEffect(() => {
    if (viewUserId === null || viewUserId === currentUser?.id || knownUser?.id === viewUserId) return;
    let cancelled = false;
    socialUserService
      .getProfile(viewUserId)
      .then((author) => !cancelled && setKnownUser(toSocialUser(author)))
      .catch(() => {
        if (cancelled) return;
        toast.show("Không tìm thấy người dùng này", "error");
        changeFilter(null);
      });
    return () => {
      cancelled = true;
    };
  }, [viewUserId, currentUser?.id, knownUser?.id, toast, changeFilter]);

  const showUserPosts = useCallback(
    (user: SocialUser | null) => {
      if (user) setKnownUser(user);
      changeFilter(user ? { user: String(user.id) } : null);
    },
    [changeFilter],
  );

  // Mục đang chọn ở menu trái: bảng tin chung → "feed", đang theo dõi → "following",
  // xem chính mình → "profile", còn lại (người khác / hashtag / dự án) → không mục nào
  const activeMenu =
    filter.type === "all"
      ? "feed"
      : filter.type === "following"
        ? "following"
        : filter.type === "user" && filter.userId === currentUser?.id
          ? "profile"
          : "";

  const selectMenu = useCallback(
    (id: string) => {
      if (id === "profile" && currentUser) showUserPosts(currentUser);
      else if (id === "following") changeFilter({ feed: "following" });
      else if (id === "feed") changeFilter(null);
    },
    [currentUser, showUserPosts, changeFilter],
  );

  return {
    ...feed,
    posts,
    // Bài đang đăng ngầm (thẻ có thanh tiến trình ở đầu bảng tin)
    uploads,
    currentUser,
    authReady,
    filter,
    viewUser,
    showUserPosts,
    clearFilter: () => changeFilter(null),
    activeMenu,
    selectMenu,
    sentinelRef,
  };
}
