import { ArrowLeft, Check, Loader2, UserPlus, UserRound } from "lucide-react";
import Avatar from "../../common/Avatar";
import { useLoginRedirect } from "../../../hooks/auth/useLoginRedirect";
import { useFollow } from "../../../hooks/social/useFollow";
import type { SocialUser } from "../../../types/social/social.types";

type Props = {
  user: SocialUser;
  isMe: boolean;
  // Khách bấm "Theo dõi" thì sang trang đăng nhập
  isGuest: boolean;
  onBack: () => void;
};

// Header trang cá nhân khi bảng tin đang lọc theo bài của 1 người: bìa navy có quầng vàng + lưới mờ,
// avatar lớn đè mép bìa, tên + số người theo dõi, nút theo dõi (trang người khác), nút quay về bảng tin
export default function ViewingUserBanner({ user, isMe, isGuest, onBack }: Props) {
  const { stats, toggling, toggle } = useFollow(user.id);
  const goLogin = useLoginRedirect();
  const following = stats?.following ?? false;

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="relative h-28 bg-linear-to-r from-ink-900 via-indigo-900 to-violet-800 md:h-32">
        <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgba(74, 114, 98,0.5),transparent_60%)]" aria-hidden />
        <span
          className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:28px_28px]"
          aria-hidden
        />
        <button
          type="button"
          onClick={onBack}
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-white/20"
        >
          <ArrowLeft size={14} /> Bảng tin
        </button>
      </div>
      <div className="flex flex-wrap items-end gap-4 px-5 pb-5">
        <Avatar src={user.avatarUrl} fullName={user.fullName} className="relative z-10 -mt-10 h-20 w-20 shrink-0 text-2xl ring-4 ring-white md:-mt-12 md:h-24 md:w-24" />
        <div className="min-w-0 flex-1 pb-1">
          <h2 className="heading-display truncate text-2xl text-heading md:text-3xl">{user.fullName}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <UserRound size={13} className="text-violet-500" /> {isMe ? "Trang của bạn" : "Trang cá nhân"}
            </span>
            {stats && (
              <>
                <span>
                  <b className="text-heading">{stats.followerCount.toLocaleString("vi-VN")}</b> người theo dõi
                </span>
                <span>
                  Đang theo dõi <b className="text-heading">{stats.followingCount.toLocaleString("vi-VN")}</b>
                </span>
              </>
            )}
          </p>
        </div>
        {!isMe && (
          <button
            type="button"
            onClick={isGuest ? goLogin : () => void toggle()}
            disabled={toggling}
            className={`mb-1 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
              following
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-primary-600 text-white hover:bg-primary-700"
            }`}
          >
            {toggling ? (
              <Loader2 size={16} className="animate-spin" />
            ) : following ? (
              <Check size={16} />
            ) : (
              <UserPlus size={16} />
            )}
            {following ? "Đang theo dõi" : "Theo dõi"}
          </button>
        )}
      </div>
    </section>
  );
}
