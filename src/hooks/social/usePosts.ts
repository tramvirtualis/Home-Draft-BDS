import { useCallback, useEffect, useRef, useState } from "react";
import postService from "../../services/social/postService";
import { getErrorMessage } from "../../api/http";
import type {
  CreatePostRequest,
  PostQuery,
  PostResponse,
  PostScope,
  SharePostRequest,
} from "../../types/social/social.types";

// query: lọc theo người đăng / hashtag / dự án; không truyền thì lấy cả bảng tin.
// enabled = false: không tải bài (màn hình không hiện bảng tin, vd danh sách đang theo dõi)
export function usePosts(query: PostQuery = {}, size = 10, enabled = true) {
  // Gom bộ lọc thành chuỗi để effect chỉ tải lại khi bộ lọc thật sự đổi (object mới mỗi lần render)
  const queryKey = JSON.stringify(query);
  const userId = query.userId;
  const [posts, setPosts] = useState<PostResponse[]>([]);
  // Mốc tải tiếp BE trả về: bài mới đăng hay bài bị xóa không làm trùng / sót bài khi cuộn
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  // Đã xong lần tải đầu (dù lỗi hay không): dùng để chỉ hiện skeleton cả trang 1 lần
  const [initialized, setInitialized] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const busy = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setInitialized(true);
      return;
    }
    let ignore = false;
    busy.current = true;
    setLoading(true);
    setError(null);

    postService
      .getPosts(null, size, JSON.parse(queryKey) as PostQuery)
      .then((res) => {
        if (ignore) return;
        setPosts(res.items);
        setCursor(res.nextCursor);
        setHasMore(res.hasMore);
      })
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => {
        if (ignore) return;
        busy.current = false;
        setLoading(false);
        setInitialized(true);
      });

    return () => {
      ignore = true;
    };
  }, [size, queryKey, reloadKey, enabled]);

  const loadMore = useCallback(async () => {
    if (busy.current || !hasMore) return;
    busy.current = true;
    setLoadingMore(true);
    try {
      const res = await postService.getPosts(cursor, size, JSON.parse(queryKey) as PostQuery);
      setPosts((prev) => [...prev, ...res.items]);
      setCursor(res.nextCursor);
      setHasMore(res.hasMore);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      busy.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, cursor, size, queryKey]);

  // Đăng xong thì bài mới lên đầu danh sách; lỗi được ném ra để bên gọi hiển thị (thẻ đang đăng cho thử lại)
  const createPost = useCallback(async (request: CreatePostRequest, onProgress?: (ratio: number) => void) => {
    const created = await postService.createPost(request, onProgress);
    setPosts((prev) => [created, ...prev]);
    return created;
  }, []);

  // Chia sẻ bài: bài chia sẻ mới lên đầu danh sách (trừ khi đang xem trang của người khác),
  // bài gốc ở mọi chỗ trong danh sách (bài thường hoặc nhúng trong bài chia sẻ) tăng lượt chia sẻ.
  // Lỗi được ném ra để bên gọi hiển thị
  const sharePost = useCallback(
    async (postId: number, request: SharePostRequest) => {
      const created = await postService.sharePost(postId, request);
      const rootId = created.sharedPostId;
      const bump = (p: PostResponse): PostResponse => (p.id === rootId ? { ...p, shareCount: p.shareCount + 1 } : p);
      setPosts((prev) => {
        const updated = prev.map((p) => ({ ...bump(p), sharedPost: p.sharedPost && bump(p.sharedPost) }));
        return userId === undefined || userId === created.author.id ? [created, ...updated] : updated;
      });
      return created;
    },
    [userId],
  );

  // Người đăng đổi phạm vi bài của mình; lỗi được ném ra để bên gọi hiển thị
  const updateScope = useCallback(async (postId: number, scope: PostScope) => {
    const updated = await postService.updateScope(postId, scope);
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, scope: updated.scope } : p)));
  }, []);

  // Người đăng xóa bài: gỡ khỏi danh sách; bài chia sẻ lại bài này thì không còn hiện bài gốc nữa
  const deletePost = useCallback(async (postId: number) => {
    await postService.deletePost(postId);
    setPosts((prev) =>
      prev.filter((p) => p.id !== postId).map((p) => (p.sharedPost?.id === postId ? { ...p, sharedPost: null } : p)),
    );
  }, []);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    posts,
    loading,
    initialized,
    loadingMore,
    error,
    hasMore,
    loadMore,
    createPost,
    sharePost,
    updateScope,
    deletePost,
    refetch,
  };
}
