import axios from "axios";
import { authHttp } from "../../api/http";

export interface MultipartUploadProgress {
  loadedBytes: number;
  totalBytes: number;
  ratio: number; // 0..1
  currentMB: number;
  totalMB: number;
  part: number;
  totalParts: number;
}

export interface MultipartUploadOptions {
  folder?: string;
  chunkSize?: number; // Mặc định 5MB (chuẩn tối thiểu của S3)
  onProgress?: (progress: MultipartUploadProgress) => void;
  signal?: AbortSignal;
}

interface InitiateResponse {
  uploadId: string;
  key: string;
  fileUrl: string;
}

interface PresignedPartResponse {
  uploadUrl: string;
  headers: Record<string, string>;
}

interface CompleteResponse {
  fileUrl: string;
}

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Chia nhỏ file thành các phần (chunk) theo megabyte và tải trực tiếp lên Object Storage (S3 Multipart Upload).
 * Sau khi tải đủ các phần, máy chủ sẽ ghép lại thành file hoàn chỉnh và trả về URL public.
 */
export async function uploadMultipart(
  file: File,
  options?: MultipartUploadOptions
): Promise<string> {
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const totalParts = Math.max(1, Math.ceil(file.size / chunkSize));
  const folder = options?.folder ?? "floor-plans";

  // Lấy đuôi mở rộng của file
  const lastDot = file.name.lastIndexOf(".");
  let extension = lastDot >= 0 ? file.name.substring(lastDot + 1).toLowerCase() : "";
  if (!extension) {
    if (file.type === "image/png") extension = "png";
    else if (file.type === "image/webp") extension = "webp";
    else if (file.type === "application/pdf") extension = "pdf";
    else extension = "jpg";
  }
  if (extension === "jpeg") {
    extension = "jpg";
  }

  // 1. Khởi tạo phiên multipart upload
  const init = await authHttp.post<InitiateResponse>(
    "/uploads/multipart/initiate",
    {
      folder,
      contentType: file.type || "application/octet-stream",
      extension,
      size: file.size,
    },
    { silentLoading: true }
  );

  const { uploadId, key } = init;
  let isAborted = false;

  const abortUpload = async () => {
    if (isAborted) return;
    isAborted = true;
    try {
      await authHttp.post(
        "/uploads/multipart/abort",
        { key, uploadId },
        { silentLoading: true }
      );
    } catch {
      // Bỏ qua lỗi khi hủy
    }
  };

  if (options?.signal) {
    options.signal.addEventListener("abort", () => {
      void abortUpload();
    });
  }

  const completedParts: { partNumber: number; eTag: string }[] = [];
  let uploadedBytesBefore = 0;

  try {
    // 2. Cắt file thành các chunk và tải từng chunk
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      if (options?.signal?.aborted) {
        await abortUpload();
        throw new DOMException("Đã hủy tải lên", "AbortError");
      }

      const start = (partNumber - 1) * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const chunk = file.slice(start, end);

      // Xin link PUT tạm thời cho part này
      const partPresign = await authHttp.post<PresignedPartResponse>(
        "/uploads/multipart/part",
        {
          key,
          uploadId,
          partNumber,
          ttlSeconds: 600,
        },
        { silentLoading: true }
      );

      // Tải chunk trực tiếp lên Object Storage
      const putRes = await axios.put(partPresign.uploadUrl, chunk, {
        headers: partPresign.headers,
        signal: options?.signal,
        timeout: 0,
        onUploadProgress: (e) => {
          const currentChunkLoaded = e.loaded ?? 0;
          const currentTotalLoaded = uploadedBytesBefore + currentChunkLoaded;
          options?.onProgress?.({
            loadedBytes: currentTotalLoaded,
            totalBytes: file.size,
            ratio: file.size > 0 ? currentTotalLoaded / file.size : 0,
            currentMB: currentTotalLoaded / (1024 * 1024),
            totalMB: file.size / (1024 * 1024),
            part: partNumber,
            totalParts,
          });
        },
      });

      uploadedBytesBefore += chunk.size;

      // Đọc ETag trả về từ Object Storage
      const rawETag = putRes.headers["etag"] || putRes.headers["ETag"];
      if (!rawETag) {
        throw new Error(`Không nhận được ETag cho phần tải ${partNumber}`);
      }
      const cleanETag = String(rawETag).replace(/^"|"$/g, "");
      completedParts.push({ partNumber, eTag: cleanETag });
    }

    if (options?.signal?.aborted) {
      await abortUpload();
      throw new DOMException("Đã hủy tải lên", "AbortError");
    }

    // 3. Ghép các part thành file hoàn chỉnh
    const complete = await authHttp.post<CompleteResponse>(
      "/uploads/multipart/complete",
      {
        key,
        uploadId,
        parts: completedParts,
        expectedSize: file.size,
      },
      { silentLoading: true }
    );

    return complete.fileUrl;
  } catch (error) {
    await abortUpload();
    throw error;
  }
}

