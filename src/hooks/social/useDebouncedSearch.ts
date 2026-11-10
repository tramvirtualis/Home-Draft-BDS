import { useEffect, useState } from "react";

// Gọi search(keyword) sau khi ngừng gõ delay ms; keyword rỗng / null thì xoá kết quả, lần gọi cũ về muộn thì bỏ qua
export function useDebouncedSearch<T>(keyword: string | null, search: (keyword: string) => Promise<T[]>, delay = 250) {
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = keyword?.trim() ?? "";
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      search(trimmed)
        .then((res) => !cancelled && setResults(res))
        .catch(() => !cancelled && setResults([]))
        .finally(() => !cancelled && setLoading(false));
    }, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [keyword, search, delay]);

  return { results, loading };
}
