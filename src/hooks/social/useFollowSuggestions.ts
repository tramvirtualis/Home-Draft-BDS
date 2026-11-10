import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../../api";
import { useToast } from "../../components/common/toastContext";
import followService from "../../services/social/followService";
import socialUserService from "../../services/social/socialUserService";
import { toSocialUser, type SocialUser } from "../../types/social/social.types";

// Khung "Gợi ý theo dõi": chỉ tải khi đã đăng nhập; theo dõi xong thì người đó rời khỏi danh sách
export function useFollowSuggestions(enabled: boolean, size = 5) {
  const [users, setUsers] = useState<SocialUser[]>([]);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (!enabled) {
      setUsers([]);
      return;
    }
    let cancelled = false;
    socialUserService
      .suggestions(size)
      .then((res) => !cancelled && setUsers(res.map(toSocialUser)))
      .catch(() => !cancelled && setUsers([]));
    return () => {
      cancelled = true;
    };
  }, [enabled, size]);

  const follow = useCallback(
    async (user: SocialUser) => {
      setPendingId(user.id);
      try {
        await followService.toggle(user.id);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        toast.show(`Đã theo dõi ${user.fullName}`);
      } catch (err) {
        toast.show(getErrorMessage(err), "error");
      } finally {
        setPendingId(null);
      }
    },
    [toast],
  );

  return { users, pendingId, follow };
}
