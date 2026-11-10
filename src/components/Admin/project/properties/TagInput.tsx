import { useId, useRef, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

type Props = {
  value: string[] | undefined;
  onChange: (next: string[]) => void;
  suggestions?: string[]; // gợi ý (loại hình đã có của dự án)
  placeholder?: string;
  invalid?: boolean;
  max?: number;
  maxLength?: number;
};

// Thêm nhãn: bỏ khoảng trắng thừa, không thêm nhãn trùng (không phân biệt hoa thường)
const addTag = (list: string[], raw: string, max: number) => {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name || list.length >= max) return list;
  return list.some((t) => t.toLowerCase() === name.toLowerCase()) ? list : [...list, name];
};

/**
 Ô nhập nhiều nhãn: gõ rồi Enter (hoặc dấu phẩy) để thêm thành một nhãn, gõ tiếp để thêm nhãn khác.
 Backspace khi ô trống xoá nhãn cuối, bấm × để xoá một nhãn. Rời ô mà còn chữ đang gõ thì cũng thêm thành nhãn.
 */
export default function TagInput({ value, onChange, suggestions = [], placeholder, invalid, max = 10, maxLength = 100 }: Props) {
  const tags = value ?? [];
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const full = tags.length >= max;

  const commit = () => {
    if (!text.trim()) return;
    onChange(addTag(tags, text, max));
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Đang gõ tiếng Việt (bộ gõ chưa chốt chữ) thì để Enter cho bộ gõ
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault(); // không gửi form
      commit();
    } else if (e.key === "Backspace" && !text && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const remaining = suggestions.filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()));

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      aria-invalid={invalid}
      className={`flex min-h-11 w-full cursor-text flex-wrap items-center gap-1.5 rounded-xl border bg-white px-2.5 py-1.5 text-sm transition focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 ${
        invalid ? "border-danger" : "border-line"
      }`}
    >
      {tags.map((t) => (
        <span key={t} className="inline-flex max-w-full items-center gap-1 rounded-lg bg-primary-50 py-1 pl-2.5 pr-1 text-xs font-semibold text-primary-700">
          <span className="truncate">{t}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(tags.filter((x) => x !== t));
            }}
            aria-label={`Bỏ loại hình ${t}`}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition hover:bg-primary-100"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      {!full && (
        <input
          ref={inputRef}
          value={text}
          maxLength={maxLength}
          list={listId}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={tags.length ? "Thêm loại hình, Enter để thêm" : placeholder}
          className="h-8 min-w-[10rem] flex-1 bg-transparent px-1.5 outline-none placeholder:text-muted"
        />
      )}
      <datalist id={listId}>
        {remaining.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}
