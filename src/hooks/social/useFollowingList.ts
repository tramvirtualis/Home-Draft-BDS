import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../../api";
import { useToast } from "../../components/common/toastContext";
import followService from "../../services/social/followService";
import type { FollowResponse, FollowingUser } from "../../types/social/social.types";

const toRow = (item: FollowResponse): FollowingUser => ({ ...item, following: true });

// Danh sách người userId đang theo dõi (cuộn vô hạn theo cursor); null = khách, danh sách trống.
// Bỏ theo dõi thì dòng vẫn ở lại và đổi nút thành "Theo dõi lại"
export function useFollowingList(userId: number | null, size = 20) {
  const [users, setUsers] = useState<FollowingUser[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const busy = useRef(false);
  const toast = useToast();

  useEffect(() => {
    if (userId === null) {
      setLoading(false);
      return;
    }
    let ignore = false;
    busy.current = true;
    setLoading(true);
    setError(null);

    followService
      .getFollowing(userId, null, size)
      .then((res) => {
        if (ignore) return;
        setUsers(res.items.map(toRow));
        setCursor(res.nextCursor);
        setHasMore(res.hasMore);
      })
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => {
        if (ignore) return;
        busy.current = false;
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [userId, size, reloadKey]);

  const loadMore = useCallback(async () => {
    if (userId === null || busy.current || !hasMore) return;
    busy.current = true;
    setLoadingMore(true);
    try {
      const res = await followService.getFollowing(userId, cursor, size);
      setUsers((prev) => [...prev, ...res.items.map(toRow)]);
      setCursor(res.nextCursor);
      setHasMore(res.hasMore);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      busy.current = false;
      setLoadingMore(false);
    }
  }, [userId, hasMore, cursor, size]);

  const toggle = useCallback(
    async (user: FollowingUser) => {
      setPendingId(user.userId);
      try {
        const res = await followService.toggle(user.userId);
        setUsers((prev) =>
          prev.map((u) =>
            u.userId === user.userId ? { ...u, following: res.following, followerCount: res.followerCount } : u,
          ),
        );
        toast.show(res.following ? "Đã theo dõi" : "Đã bỏ theo dõi");
      } catch (err) {
        toast.show(getErrorMessage(err), "error");
      } finally {
        setPendingId(null);
      }
    },
    [toast],
  );

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { users, loading, loadingMore, hasMore, error, pendingId, loadMore, toggle, refetch };
}
