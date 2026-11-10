import imageCompression from "browser-image-compression";

// Ảnh điện thoại 3–8MB → ~300–600KB trước khi upload: cạnh dài tối đa 1920px, chất lượng ~80%
const OPTIONS = {
  maxWidthOrHeight: 1920,
  maxSizeMB: 1,
  initialQuality: 0.8,
  useWebWorker: true,
};

const SKIP_TYPES = ["image/gif", "image/svg+xml"];
const SKIP_UNDER_BYTES = 300 * 1024;

export async function compressImage(file: File): Promise<File> {
  if (
    !file.type.startsWith("image/") ||
    SKIP_TYPES.includes(file.type) ||
    file.size < SKIP_UNDER_BYTES
  ) {
    return file;
  }
  try {
    const out = await imageCompression(file, OPTIONS);
    // Nén xong mà lại nặng hơn (ảnh đã tối ưu sẵn) thì giữ ảnh gốc
    return out.size < file.size
      ? new File([out], file.name, {
          type: out.type,
          lastModified: file.lastModified,
        })
      : file;
  } catch {
    return file; // lỗi nén thì vẫn gửi ảnh gốc, không chặn người dùng
  }
}

// Tạo FormData mới giữ nguyên thứ tự field, chỉ thay các file ảnh bằng bản đã nén
export async function compressFormImages(form: FormData): Promise<FormData> {
  const entries = [...form.entries()];
  if (
    !entries.some(
      ([, value]) => value instanceof File && value.type.startsWith("image/")
    )
  ) {
    return form;
  }
  const out = new FormData();
  for (const [key, value] of entries) {
    if (value instanceof File) {
      const file = await compressImage(value);
      out.append(key, file, file.name);
    } else {
      out.append(key, value);
    }
  }
  return out;
}
