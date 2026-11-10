import { useEffect, useRef, useState } from "react";
import DraftNotice from "./DraftNotice";
import { readRaw, removeRaw, useDraftKey, writeRaw } from "../../hooks/useFormDraft";

type Props = {
  form: string; // tên form, vd "notification"
  id?: string | number | null; // id bản ghi đang sửa; trống = thêm mới
  fields: string[]; // thuộc tính name của các ô cần lưu nháp (ô không điều khiển bằng state, dùng defaultValue)
};

type Snapshot = Record<string, string | boolean>;

const elementsOf = (form: HTMLFormElement, fields: string[]) =>
  fields.flatMap((name) => {
    const el = form.elements.namedItem(name);
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement ? [el] : [];
  });

const read = (form: HTMLFormElement, fields: string[]): Snapshot =>
  Object.fromEntries(
    elementsOf(form, fields).map((el) => [el.name, el instanceof HTMLInputElement && el.type === "checkbox" ? el.checked : el.value]),
  );

const write = (form: HTMLFormElement, fields: string[], data: Snapshot) => {
  for (const el of elementsOf(form, fields)) {
    const v = data[el.name];
    if (v === undefined) continue;
    if (el instanceof HTMLInputElement && el.type === "checkbox") el.checked = Boolean(v);
    else el.value = String(v);
  }
};

/**
 Lưu nháp cho form dùng ô không điều khiển (defaultValue): đặt bên trong thẻ <form>.
 Gõ tới đâu lưu tới đó, mở lại form thì điền lại, bấm lưu thì bỏ nháp. Hiện luôn dòng báo "đã khôi phục" kèm nút xóa nháp.
 */
export default function FormDraftAutosave({ form, id, fields }: Props) {
  const key = useDraftKey(form, id);
  const anchor = useRef<HTMLSpanElement>(null);
  const [restored, setRestored] = useState(false);
  const initialRef = useRef<Snapshot>({});
  const fieldsKey = fields.join(",");

  useEffect(() => {
    const el = anchor.current?.closest("form");
    if (!el) return;
    const names = fieldsKey.split(",");
    initialRef.current = read(el, names);
    const initial = JSON.stringify(initialRef.current);

    const raw = readRaw(key);
    if (raw && raw !== initial) {
      try {
        write(el, names, JSON.parse(raw) as Snapshot);
        setRestored(true);
      } catch {
        removeRaw(key);
      }
    }

    const save = () => {
      const now = JSON.stringify(read(el, names));
      if (now === initial) removeRaw(key);
      else writeRaw(key, now);
    };
    // Bấm lưu: bỏ nháp; lưu lỗi thì form vẫn mở, gõ tiếp sẽ lưu lại
    const submit = () => removeRaw(key);
    el.addEventListener("input", save);
    el.addEventListener("change", save);
    el.addEventListener("submit", submit);
    return () => {
      el.removeEventListener("input", save);
      el.removeEventListener("change", save);
      el.removeEventListener("submit", submit);
    };
  }, [key, fieldsKey]);

  const discard = () => {
    removeRaw(key);
    const el = anchor.current?.closest("form");
    if (el) write(el, fields, initialRef.current); // chỉ đưa các ô có nháp về giá trị ban đầu
    setRestored(false);
  };

  return (
    <>
      <span ref={anchor} hidden />
      <DraftNotice show={restored} onDiscard={discard} />
    </>
  );
}
