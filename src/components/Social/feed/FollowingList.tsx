import { Check, Loader2, UserPlus } from "lucide-react";
import Avatar from "../../common/Avatar";
import { useFollowingList } from "../../../hooks/social/useFollowingList";
import { useInfiniteScroll } from "../../../hooks/social/useInfiniteScroll";
import { toSocialUser, type SocialUser } from "../../../types/social/social.types";

type Props = {
  // Người đang đăng nhập; null = khách
  userId: number | null;
  // Bấm vào một người: xem trang cá nhân của họ
  onUserClick: (user: SocialUser) => void;
};

// Mục "Đang theo dõi": mỗi dòng có tên, số người theo dõi, nhãn "Theo dõi bạn" nếu họ theo dõi lại,
// nút bỏ theo dõi / theo dõi lại
export default function FollowingList({ userId, onUserClick }: Props) {
  const { users, loading, loadingMore, hasMore, error, pendingId, loadMore, toggle, refetch } =
    useFollowingList(userId);
  const sentinelRef = useInfiniteScroll(loadMore, hasMore);

  if (loading) {
    return (
      <ul className="divide-y divide-line rounded-2xl border border-line bg-white" aria-hidden>
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex animate-pulse items-center gap-3 p-4">
            <span className="h-11 w-11 shrink-0 rounded-full bg-gray-100" />
            <span className="flex-1 space-y-2">
              <span className="block h-3.5 w-1/3 rounded bg-gray-100" />
              <span className="block h-3 w-1/4 rounded bg-gray-100" />
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-danger">{error}</p>
        <button
          onClick={refetch}
          className="mt-3 rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
        Bạn chưa theo dõi ai. Hãy theo dõi thêm người để kết nối với họ.
      </p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
        {users.map((u) => {
          const name = u.fullName ?? "Người dùng";
          return (
            <li key={u.userId} className="flex items-center gap-3 p-4">
              <button
                type="button"
                onClick={() => onUserClick(toSocialUser({ id: u.userId, fullName: u.fullName, avatarUrl: u.avatarUrl }))}
                className="flex min-w-0 flex-1 items-center gap-3 text-left hover:opacity-80"
              >
                <Avatar src={u.avatarUrl} fullName={name} className="h-11 w-11 shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-heading">{name}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                    <span>
                      <b className="text-heading">{u.followerCount.toLocaleString("vi-VN")}</b> người theo dõi
                    </span>
                    {u.followsMe && (
                      <span className="rounded-full bg-primary-50 px-2 py-0.5 font-medium text-primary-600">
                        Theo dõi bạn
                      </span>
                    )}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => void toggle(u)}
                disabled={pendingId !== null}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                  u.following
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-primary-600 text-white hover:bg-primary-700"
                }`}
              >
                {pendingId === u.userId ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : u.following ? (
                  <Check size={14} />
                ) : (
                  <UserPlus size={14} />
                )}
                {u.following ? "Đang theo dõi" : "Theo dõi lại"}
              </button>
            </li>
          );
        })}
      </ul>

      <div ref={sentinelRef} />
      {loadingMore && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500" role="status">
          <Loader2 size={22} className="animate-spin text-primary-600" aria-hidden />
          Đang tải thêm...
        </div>
      )}
    </>
  );
}
