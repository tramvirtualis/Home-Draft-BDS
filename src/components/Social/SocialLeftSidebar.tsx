import EventList from "./EventList";
import FollowSuggestions from "./FollowSuggestions";
import NewsList from "./NewsList";
import SocialMenu from "./SocialMenu";
import UserCard from "./sidebar/UserCard";
import type { SocialUser } from "../../types/social/social.types";

type Props = {
  // null = khách: ẩn thẻ người dùng và gợi ý theo dõi
  user: SocialUser | null;
  activeId: string;
  onSelect: (id: string) => void;
  onUserClick: (user: SocialUser) => void;
};

export default function SocialLeftSidebar({ user, activeId, onSelect, onUserClick }: Props) {
  return (
    <aside className="hidden lg:block">
      <div className="space-y-6">
        {user && <UserCard user={user} onClick={() => onSelect("profile")} />}
        <SocialMenu activeId={activeId} onSelect={onSelect} />
        {user && <FollowSuggestions onUserClick={onUserClick} />}
        <NewsList />
        <EventList />
      </div>

      {/* Cuộn tới đây mới dính (fixed) lại */}
      <div className="sticky top-22 mt-6">
        <SocialMenu activeId={activeId} onSelect={onSelect} />
      </div>
    </aside>
  );
}
