import { Fragment } from "react";
import { Link } from "react-router-dom";
import { splitPostText } from "../../../utils/postText";

type Props = {
  text: string;
  // false: hashtag hiện như chữ thường (bình luận không lưu hashtag nên bấm vào cũng không ra bài nào)
  hashtags?: boolean;
};

export const hashtagPath = (tag: string) => `/social?hashtag=${encodeURIComponent(tag)}`;

// Chữ thuần của bài viết / bình luận: link bấm được (mở tab mới), hashtag dẫn tới danh sách bài cùng tag
export default function PostText({ text, hashtags = true }: Props) {
  return (
    <>
      {splitPostText(text).map((part, i) => {
        if (part.type === "url") {
          return (
            <a
              key={i}
              href={part.href}
              target="_blank"
              // Link người dùng tự dán: không truyền uy tín SEO sang trang ngoài, không lộ trang nguồn
              rel="nofollow noopener noreferrer ugc"
              onClick={(e) => e.stopPropagation()}
              className="break-all text-primary-600 hover:underline"
            >
              {part.value}
            </a>
          );
        }
        if (part.type === "hashtag" && hashtags) {
          return (
            <Link
              key={i}
              to={hashtagPath(part.tag)}
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-primary-600 hover:underline"
            >
              {part.value}
            </Link>
          );
        }
        return <Fragment key={i}>{part.value}</Fragment>;
      })}
    </>
  );
}
