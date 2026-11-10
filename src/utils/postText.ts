// Tách nội dung bài viết / bình luận thành các đoạn chữ, link và hashtag để hiển thị.
// Regex hashtag phải khớp HashtagParser bên BE: chữ nào hiện thành link thì BE cũng đã lưu để lọc.

export type TextPart =
  | { type: "text"; value: string }
  | { type: "url"; value: string; href: string }
  | { type: "hashtag"; value: string; tag: string };

// Link: bắt đầu bằng http(s):// hoặc www.; "#" không dính sau chữ / số / "/" / "&" (link có #anchor, &#39;)
const TOKEN =
  /(\b(?:https?:\/\/|www\.)[^\s<>"]+)|(?<![\p{L}\p{M}\p{N}_&/#])#([\p{L}\p{M}\p{N}_]{1,100})/giu;
const HAS_LETTER = /\p{L}/u;
// Dấu câu dính cuối link thường không thuộc link: "xem https://abc.vn." → bỏ dấu chấm
const TRAILING_PUNCTUATION = /[.,!?;:'")\]}]+$/;

export function splitPostText(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  const pushText = (end: number) => {
    if (end > last) parts.push({ type: "text", value: text.slice(last, end) });
  };

  for (const match of text.matchAll(TOKEN)) {
    const start = match.index ?? 0;
    const [raw, url, tag] = match;
    if (url) {
      const value = url.replace(TRAILING_PUNCTUATION, "");
      pushText(start);
      parts.push({ type: "url", value, href: value.startsWith("www.") ? `https://${value}` : value });
      last = start + value.length;
    } else if (tag && HAS_LETTER.test(tag)) {
      pushText(start);
      parts.push({ type: "hashtag", value: raw, tag: tag.toLowerCase() });
      last = start + raw.length;
    }
  }
  pushText(text.length);
  return parts;
}

// Hashtag đang gõ dở ngay trước con trỏ ("... #qua|" → "qua"); không có thì null
export function hashtagBeforeCursor(text: string, cursor: number): { tag: string; start: number } | null {
  const match = /(?<![\p{L}\p{M}\p{N}_&/#])#([\p{L}\p{M}\p{N}_]{0,100})$/u.exec(text.slice(0, cursor));
  return match ? { tag: match[1], start: match.index } : null;
}
