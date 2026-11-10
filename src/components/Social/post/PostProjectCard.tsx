import { Building2, ChevronRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { PostProject } from "../../../types/social/social.types";

type Props = {
  project: PostProject | null;
};

// Thẻ dự án được gắn vào bài: ảnh, tên, địa chỉ; bấm vào mở trang dự án
export default function PostProjectCard({ project }: Props) {
  if (!project) return null;

  return (
    <Link
      to={`/projects/${project.id}`}
      onClick={(e) => e.stopPropagation()}
      className="mb-3 flex items-center gap-3 rounded-xl border border-line bg-gray-50 p-2 transition hover:border-primary-200 hover:bg-primary-50/50"
    >
      {project.imageUrl ? (
        <img src={project.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" loading="lazy" />
      ) : (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <Building2 size={24} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500">Dự án được nhắc tới</p>
        <p className="truncate text-sm font-semibold text-heading">{project.name}</p>
        {project.location && (
          <p className="flex items-center gap-1 truncate text-xs text-gray-500">
            <MapPin size={12} className="shrink-0" /> {project.location}
          </p>
        )}
      </div>
      <ChevronRight size={18} className="shrink-0 text-gray-400" />
    </Link>
  );
}
