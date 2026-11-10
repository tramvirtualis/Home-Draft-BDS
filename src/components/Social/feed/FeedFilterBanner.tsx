import { ArrowLeft, Building2, ChevronRight, Hash, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useFeedProject } from "../../../hooks/social/useFeedProject";
import type { FeedFilter } from "../../../hooks/social/useSocialFeed";

type Props = {
  filter: Extract<FeedFilter, { type: "hashtag" | "project" | "following" }>;
  onBack: () => void;
};

// Đầu bảng tin khi đang lọc: theo hashtag, theo dự án hoặc "Đang theo dõi"; nút quay về bảng tin chung
export default function FeedFilterBanner({ filter, onBack }: Props) {
  const project = useFeedProject(filter.type === "project" ? filter.projectId : null);

  const { icon: Icon, label, title, box } =
    filter.type === "hashtag"
      ? { icon: Hash, label: "Bài viết có hashtag", title: `#${filter.tag}`, box: "bg-sky-50 text-sky-600" }
      : filter.type === "project"
        ? {
            icon: Building2,
            label: "Bài viết về dự án",
            title: project?.name ?? "Dự án",
            box: "bg-emerald-50 text-emerald-600",
          }
        : {
            icon: UsersRound,
            label: "Kết nối",
            title: "Người bạn đang theo dõi",
            box: "bg-rose-50 text-rose-600",
          };

  return (
    <section className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
      {filter.type === "project" && project?.imageUrl ? (
        <img src={project.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
      ) : (
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${box}`}>
          <Icon size={22} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted">{label}</p>
        <h2 className="truncate text-lg font-bold text-heading">{title}</h2>
        {filter.type === "project" && (
          <Link
            to={`/projects/${filter.projectId}`}
            className="inline-flex items-center gap-0.5 text-xs font-medium text-primary-600 hover:underline"
          >
            Xem trang dự án <ChevronRight size={14} />
          </Link>
        )}
      </div>
      <button
        type="button"
        onClick={onBack}
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
      >
        <ArrowLeft size={14} /> Bảng tin
      </button>
    </section>
  );
}
