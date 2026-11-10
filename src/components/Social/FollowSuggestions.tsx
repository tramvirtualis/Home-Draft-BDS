import { Loader2 } from "lucide-react";
import Avatar from "../common/Avatar";
import { useFollowSuggestions } from "../../hooks/social/useFollowSuggestions";
import type { SocialUser } from "../../types/social/social.types";

type Props = {
  // Bấm vào người được gợi ý: xem trang cá nhân của họ
  onUserClick: (user: SocialUser) => void;
};

// Người đăng nhiều bài mà mình chưa theo dõi (chỉ hiện khi đã đăng nhập và có gợi ý)
export default function FollowSuggestions({ onUserClick }: Props) {
  const { users, pendingId, follow } = useFollowSuggestions(true);
  if (users.length === 0) return null;

  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-500">Gợi ý theo dõi</h3>
      <ul className="space-y-3">
        {users.map((u) => (
          <li key={u.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onUserClick(u)}
              className="flex min-w-0 flex-1 items-center gap-2 text-left hover:opacity-80"
            >
              <Avatar src={u.avatarUrl} fullName={u.fullName} className="h-9 w-9 shrink-0" />
              <span className="truncate text-sm font-medium text-gray-800">{u.fullName}</span>
            </button>
            <button
              type="button"
              onClick={() => void follow(u)}
              disabled={pendingId !== null}
              className="flex shrink-0 items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-100 disabled:opacity-60"
            >
              {pendingId === u.id && <Loader2 size={12} className="animate-spin" />}
              Theo dõi
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
