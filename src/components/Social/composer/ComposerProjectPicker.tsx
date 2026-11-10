import { useState } from "react";
import { Building2, Loader2, MapPin, Search, X } from "lucide-react";
import { useComposerProjectSearch } from "../../../hooks/social/useComposerProjectSearch";
import type { PostProject } from "../../../types/social/social.types";

type Props = {
  selected: PostProject | null;
  onSelect: (project: PostProject | null) => void;
  // Đóng ô tìm (chưa chọn dự án nào)
  onClose: () => void;
  disabled?: boolean;
};

// Gắn dự án vào bài: đã chọn thì hiện thẻ dự án kèm nút bỏ; chưa chọn thì hiện ô tìm theo tên dự án
export default function ComposerProjectPicker({ selected, onSelect, onClose, disabled }: Props) {
  const [keyword, setKeyword] = useState("");
  const { results, loading } = useComposerProjectSearch(keyword);

  if (selected) {
    return (
      <div className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-gray-50 p-2">
        <ProjectThumb project={selected} />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500">Gắn dự án</p>
          <p className="truncate text-sm font-semibold text-heading">{selected.name}</p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          disabled={disabled}
          aria-label="Bỏ gắn dự án"
          className="rounded-full p-1.5 text-gray-500 hover:bg-gray-200 disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-gray-200 p-2">
      <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
        <Search size={16} className="shrink-0 text-gray-500" />
        <input
          autoFocus
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          disabled={disabled}
          placeholder="Tìm dự án theo tên..."
          aria-label="Tìm dự án"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        {loading && <Loader2 size={16} className="shrink-0 animate-spin text-gray-400" />}
        <button type="button" onClick={onClose} aria-label="Đóng tìm dự án" className="shrink-0 text-gray-500 hover:text-gray-700">
          <X size={16} />
        </button>
      </div>
      {keyword.trim() && !loading && results.length === 0 && (
        <p className="px-2 py-3 text-center text-sm text-gray-500">Không tìm thấy dự án nào.</p>
      )}
      {results.length > 0 && (
        <ul className="mt-1 max-h-56 overflow-y-auto">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect(p)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-gray-50"
              >
                <ProjectThumb project={p} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-heading">{p.name}</p>
                  {p.location && (
                    <p className="flex items-center gap-1 truncate text-xs text-gray-500">
                      <MapPin size={12} className="shrink-0" /> {p.location}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProjectThumb({ project }: { project: PostProject }) {
  return project.imageUrl ? (
    <img src={project.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
      <Building2 size={18} />
    </span>
  );
}
