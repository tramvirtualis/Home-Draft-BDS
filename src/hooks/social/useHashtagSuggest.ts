import { useCallback, useState, type KeyboardEvent, type RefObject } from "react";
import hashtagService from "../../services/social/hashtagService";
import { hashtagBeforeCursor } from "../../utils/postText";
import { useDebouncedSearch } from "./useDebouncedSearch";

const suggest = (keyword: string) => hashtagService.suggest(keyword);

// Gợi ý hashtag khi đang gõ "#abc" trong ô đăng bài: ↑ ↓ chọn, Enter / Tab chèn, Esc đóng.
// Gọi sync() mỗi khi nội dung / con trỏ đổi để biết đang gõ dở hashtag nào
export function useHashtagSuggest(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  setContent: (value: string) => void,
) {
  // Hashtag đang gõ dở và vị trí dấu "#"; null = không gõ hashtag
  const [active, setActive] = useState<{ tag: string; start: number } | null>(null);
  const [highlight, setHighlight] = useState(0);
  const { results } = useDebouncedSearch(active?.tag || null, suggest);
  // Gõ đúng y tag duy nhất được gợi ý thì không cần hiện nữa
  const options = results.filter((h) => !(results.length === 1 && h.tag === active?.tag.toLowerCase()));
  const open = active !== null && options.length > 0;

  const sync = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const next = el.selectionStart === el.selectionEnd ? hashtagBeforeCursor(el.value, el.selectionStart) : null;
    setActive((prev) => (prev?.tag === next?.tag && prev?.start === next?.start ? prev : next));
    setHighlight(0);
  }, [textareaRef]);

  const pick = useCallback(
    (tag: string) => {
      const el = textareaRef.current;
      if (!el || !active) return;
      const cursor = el.selectionStart;
      const before = el.value.slice(0, active.start);
      const after = el.value.slice(cursor);
      const inserted = `#${tag} `;
      setContent(before + inserted + after.replace(/^ /, ""));
      setActive(null);
      // Đặt con trỏ ngay sau hashtag vừa chèn (sau khi React cập nhật ô nhập)
      requestAnimationFrame(() => {
        el.focus();
        const pos = before.length + inserted.length;
        el.setSelectionRange(pos, pos);
      });
    },
    [active, setContent, textareaRef],
  );

  // Gắn vào onKeyDown của ô nhập; chỉ chặn phím khi danh sách gợi ý đang mở
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setHighlight((h) => (h + step + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      pick(options[highlight]?.tag ?? options[0].tag);
    } else if (e.key === "Escape") {
      // Chỉ đóng gợi ý, không đóng cả modal
      e.preventDefault();
      e.stopPropagation();
      setActive(null);
    }
  };

  return { open, options, highlight, sync, pick, onKeyDown, close: () => setActive(null) };
}
