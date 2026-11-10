import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../../api";
import { useToast } from "../../components/common/toastContext";
import followService from "../../services/social/followService";
import type { FollowStats } from "../../types/social/social.types";

// Số người theo dõi / đang theo dõi của userId và nút bật/tắt theo dõi (null = chưa chọn ai)
export function useFollow(userId: number | null) {
  const [stats, setStats] = useState<FollowStats | null>(null);
  const [toggling, setToggling] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setStats(null);
    if (userId === null) return;
    let cancelled = false;
    followService
      .getStats(userId)
      .then((res) => !cancelled && setStats(res))
      .catch(() => {
        // Không lấy được số liệu thì chỉ ẩn phần số, trang cá nhân vẫn dùng được
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggle = useCallback(async () => {
    if (userId === null || toggling) return;
    setToggling(true);
    try {
      const res = await followService.toggle(userId);
      setStats(res);
      toast.show(res.following ? "Đã theo dõi" : "Đã bỏ theo dõi");
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setToggling(false);
    }
  }, [userId, toggling, toast]);

  return { stats, toggling, toggle };
}
