import type { Hashtag } from "../../../types/social/social.types";

type Props = {
  options: Hashtag[];
  highlight: number;
  onPick: (tag: string) => void;
};

// Danh sách hashtag gợi ý ngay dưới ô nhập khi đang gõ "#..."
export default function ComposerHashtagSuggestions({ options, highlight, onPick }: Props) {
  return (
    <ul role="listbox" aria-label="Gợi ý hashtag" className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {options.map((h, i) => (
        <li key={h.tag} role="option" aria-selected={i === highlight}>
          <button
            type="button"
            // mousedown thay vì click: không làm ô nhập mất focus (mất vị trí con trỏ) trước khi chèn
            onMouseDown={(e) => {
              e.preventDefault();
              onPick(h.tag);
            }}
            className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
              i === highlight ? "bg-primary-50" : "hover:bg-gray-50"
            }`}
          >
            <span className="font-medium text-primary-600">#{h.tag}</span>
            <span className="text-xs text-gray-500">{h.postCount.toLocaleString("vi-VN")} bài viết</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
