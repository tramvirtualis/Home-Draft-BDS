import { useEffect, useState } from "react";
import hashtagService from "../../services/social/hashtagService";
import type { Hashtag } from "../../types/social/social.types";

// Hashtag nhiều bài nhất 30 ngày gần đây cho khung "Xu hướng"; lỗi thì coi như chưa có
export function useTrendingHashtags(size = 5) {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);

  useEffect(() => {
    let cancelled = false;
    hashtagService
      .trending(size)
      .then((res) => !cancelled && setHashtags(res))
      .catch(() => !cancelled && setHashtags([]));
    return () => {
      cancelled = true;
    };
  }, [size]);

  return hashtags;
}
