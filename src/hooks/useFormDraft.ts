import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRememberedProject } from "./project/useSelectedProject";

/*
 Lưu nháp cho form trong modal: người dùng gõ dở rồi đóng modal (hoặc tải lại trang) thì mở lại vẫn còn nội dung.
 Nháp giữ trong sessionStorage của tab (đóng tab là mất), khóa theo trang đang mở + tên form + id bản ghi,
 nên nháp "thêm mới" của dự án này không lẫn sang dự án khác. File (ảnh, CV) không lưu được, chỉ lưu chữ / số.
*/

const PREFIX = "dvg:draft:";
const memory = new Map<string, string>(); // dự phòng khi trình duyệt chặn sessionStorage

export const readRaw = (key: string): string | null => {
  try {
    const v = sessionStorage.getItem(PREFIX + key);
    if (v != null) return v;
  } catch {
    /* bỏ qua, dùng bộ nhớ */
  }
  return memory.get(key) ?? null;
};

export const writeRaw = (key: string, value: string) => {
  memory.set(key, value);
  try {
    sessionStorage.setItem(PREFIX + key, value);
  } catch {
    /* bỏ qua */
  }
};

export const removeRaw = (key: string) => {
  memory.delete(key);
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch {
    /* bỏ qua */
  }
};

type Options = {
  // Đang gửi lên máy chủ: gửi xong mà modal vẫn mở (lưu lỗi) thì giữ lại nháp
  busy?: boolean;
  // false: tạm tắt lưu nháp (vd modal chưa sẵn sàng)
  enabled?: boolean;
  // Form thuộc trang quản lý theo dự án (cùng đường dẫn cho mọi dự án): tách nháp theo dự án đang chọn
  projectScoped?: boolean;
  // Form điền dữ liệu sau khi tải (hoặc nạp lại sau khi lưu mà vẫn mở): đổi giá trị này mỗi lần nạp dữ liệu mới
  // để lấy lại mốc "ban đầu" (vd truyền chính object vừa tải)
  baseline?: unknown;
};

// Khóa nháp: trang đang mở (+ dự án đang chọn) + tên form + id bản ghi
export function useDraftKey(form: string, id: string | number | null | undefined, projectScoped = false) {
  const { pathname } = useLocation();
  const project = useRememberedProject();
  return `${pathname}|${projectScoped ? `p${project ?? 0}|` : ""}${form}|${id ?? "new"}`;
}

/**
 * @param form   tên form, vd "building"
 * @param id     id bản ghi đang sửa; null / undefined = thêm mới
 * @param values toàn bộ giá trị đang nhập (chỉ chữ / số / boolean / mảng / object thuần)
 * @param apply  điền lại giá trị vào form khi khôi phục nháp hoặc khi xóa nháp
 * @returns restored: đã điền lại từ nháp; clear(): gọi khi bấm lưu; discard(): xóa nháp và đưa form về ban đầu
 */
export default function useFormDraft<T extends object>(
  form: string,
  id: string | number | null | undefined,
  values: T,
  apply: (values: T) => void,
  { busy = false, enabled = true, projectScoped = false, baseline }: Options = {},
) {
  const key = useDraftKey(form, id, projectScoped);
  const json = JSON.stringify(values);

  // Giá trị ban đầu của form (lần render đầu đã sẵn sàng, hoặc lúc baseline đổi) để biết người dùng đã gõ gì chưa
  // và để đưa form về ban đầu
  const initial = useRef(json);
  const base = useRef<{ ready: boolean; token: unknown }>({ ready: false, token: baseline });
  if (enabled && (!base.current.ready || base.current.token !== baseline)) {
    base.current = { ready: true, token: baseline };
    initial.current = json;
  }
  const applyRef = useRef(apply);
  applyRef.current = apply;
  const latest = useRef(json);
  latest.current = json;

  const [restored, setRestored] = useState(false);
  const skipNextWrite = useRef(true);

  const save = useCallback(
    (snapshot: string) => {
      if (snapshot === initial.current) removeRaw(key);
      else writeRaw(key, snapshot);
    },
    [key],
  );

  // Mở modal: có nháp thì điền lại
  useEffect(() => {
    if (!enabled) return;
    const raw = readRaw(key);
    if (!raw || raw === initial.current) return;
    try {
      const draft = JSON.parse(raw) as Partial<T>;
      const start = JSON.parse(initial.current) as T;
      skipNextWrite.current = true;
      applyRef.current({ ...start, ...draft });
      setRestored(true);
    } catch {
      removeRaw(key);
    }
  }, [key, enabled]);

  // Mỗi lần gõ: ghi nháp (bỏ qua lần chạy đầu và lần ngay sau khi khôi phục)
  useEffect(() => {
    if (!enabled) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    save(json);
  }, [json, save, enabled]);

  // Gửi lên xong mà modal vẫn mở (lưu thất bại): ghi lại nháp đã xóa lúc bấm lưu
  const wasBusy = useRef(busy);
  useEffect(() => {
    if (wasBusy.current && !busy && enabled) save(latest.current);
    wasBusy.current = busy;
  }, [busy, save, enabled]);

  // Bấm lưu: bỏ nháp (lưu thành công thì modal đóng, lần mở sau lấy dữ liệu đã lưu)
  const clear = useCallback(() => {
    removeRaw(key);
    setRestored(false);
  }, [key]);

  // Nút "Xóa nháp": bỏ nháp và đưa form về như lúc mới mở
  const discard = useCallback(() => {
    removeRaw(key);
    if (latest.current !== initial.current) skipNextWrite.current = true;
    applyRef.current(JSON.parse(initial.current) as T);
    setRestored(false);
  }, [key]);

  return { restored, clear, discard };
}
