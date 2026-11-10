import { Link } from "react-router-dom";
import { hashtagPath } from "../post/PostText";
import { useTrendingHashtags } from "../../../hooks/social/useTrendingHashtags";

// Hashtag nhiều bài nhất 30 ngày gần đây; chưa có hashtag nào thì ẩn khung
export default function TrendingList() {
  const hashtags = useTrendingHashtags();
  if (hashtags.length === 0) return null;

  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-500">Xu hướng</h3>
      <ul className="space-y-1">
        {hashtags.map((h) => (
          <li key={h.tag}>
            <Link to={hashtagPath(h.tag)} className="-mx-2 block rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50">
              <p className="truncate font-medium text-gray-800">#{h.tag}</p>
              <p className="text-xs text-gray-500">{h.postCount.toLocaleString("vi-VN")} bài viết</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
