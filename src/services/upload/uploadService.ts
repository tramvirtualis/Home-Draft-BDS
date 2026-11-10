import axios from "axios";
import { authHttp } from "../../api/http";
import { compressImage } from "../../utils/compressImage";

// Khớp enum UploadPurpose bên BE: mỗi mục đích cố định folder, loại file, dung lượng tối đa và quyền cần có
export type UploadPurpose =
  // Người dùng
  | "POST_IMAGE"
  | "POST_VIDEO"
  | "AVATAR"
  | "CV"
  | "APPLICATION_CV"
  | "COMPANY_LOGO"
  // Quản trị dự án (cần PROJECT_MANAGE)
  | "PROJECT_IMAGE"
  | "PROJECT_GALLERY_IMAGE"
  | "BUILDING_IMAGE"
  | "ZONE_IMAGE"
  | "AMENITY_IMAGE"
  | "PROPERTY_IMAGE"
  | "POLICY_IMAGE"
  | "PROGRESS_IMAGE"
  | "LOCATION_IMAGE"
  | "TOUR_POPUP_IMAGE"
  // Quản trị nội dung
  | "NEWS_IMAGE"
  | "EVENT_IMAGE"
  | "SOCIAL_AD_IMAGE"
  | "CV_TEMPLATE_THUMBNAIL"
  | "DOCUMENT_THUMBNAIL"
  | "DOCUMENT_CONTENT_IMAGE";

interface PresignedUpload {
  uploadUrl: string; // link PUT tạm (5 phút)
  fileUrl: string; // link public của file sau khi upload xong
  headers: Record<string, string>; // header đã ký, phải gửi kèm đúng y như vậy
}

/**
 * Upload thẳng lên Object Storage: xin link (POST /uploads/presign) → PUT file thẳng lên s3.cloudfly.vn
 * (không đi qua Cloudflare / BE) → trả fileUrl để gửi cho BE khi lưu.
 */
export async function uploadDirect(
  file: File,
  purpose: UploadPurpose,
  onProgress?: (ratio: number) => void
): Promise<string> {
  // silentLoading: nơi gọi tự hiện tiến trình (thẻ bài đang đăng), không bật loader toàn trang
  const presigned = await authHttp.post<PresignedUpload>(
    "/uploads/presign",
    { purpose, contentType: file.type, size: file.size },
    { silentLoading: true }
  );
  // axios gốc: KHÔNG gắn token / baseURL / cookie của BE vào request gửi Object Storage
  await axios.put(presigned.uploadUrl, file, {
    headers: presigned.headers,
    timeout: 0, // file lớn (video): không giới hạn thời gian, đã có tiến độ
    onUploadProgress: (e) => onProgress?.(e.total ? e.loaded / e.total : 0),
  });
  return presigned.fileUrl;
}

// Ảnh: nén trước (như interceptor axios vẫn làm với ảnh trong FormData) rồi upload thẳng
export async function uploadImage(
  file: File,
  purpose: UploadPurpose,
  onProgress?: (ratio: number) => void
): Promise<string> {
  return uploadDirect(await compressImage(file), purpose, onProgress);
}

// Nhiều ảnh upload song song, trả link đúng thứ tự file
export async function uploadImages(files: File[], purpose: UploadPurpose): Promise<string[]> {
  return Promise.all(files.map((file) => uploadImage(file, purpose)));
}
