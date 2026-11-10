import BaseService from "../base/BaseService";
import { authHttp } from "../../api/http";
import { UPLOAD_CONFIG } from "./projectService";

// Các bước cắt và tải ô ảnh chạy hàng trăm request liên tiếp: không bật khung "Đang xử lý" chung
// (trang đã có thanh tiến độ riêng), tránh khung nháy liên tục
const SILENT_UPLOAD = { ...UPLOAD_CONFIG, silentLoading: true };
const SILENT = { silentLoading: true };
import type { FloorPlanDto, FloorPlanPinInput } from "../../types/project/project.types";
import type { TileBatch, TileSetInfo } from "../../utils/pdfTiles";

// Đọc công khai; tải ảnh, gán vị trí, xóa chỉ ADMIN
const hasText = (v: unknown) => typeof v === "string" && v !== "";

class FloorPlanService extends BaseService {
  constructor() {
    super("/floor-plans", { auth: false });
  }

  // GET /floor-plans?projectId= (null nếu dự án chưa có mặt bằng)
  async get(projectId: number): Promise<FloorPlanDto | null> {
    const res = await this.http.get<FloorPlanDto | null>(this.url(), { params: { projectId } });
    // Dự án chưa có mặt bằng: BE trả data = null (có thể bị bỏ khỏi JSON) → coi như chưa có, không phải đang tải
    return res && typeof res === "object" && (hasText(res.imageUrl) || hasText(res.pdfUrl)) ? res : null;
  }

  // POST /floor-plans (multipart: projectId, image, pdf?, pdfPage?, imageUrl?): tạo mới hoặc thay ảnh, giữ nguyên vị trí đã gán.
  // Có pdf thì bản gốc được lưu lại để khách phóng to vẫn sắc nét như xem PDF.
  async saveImage(
    projectId: number,
    image: File | null,
    pdf?: { file: File; page: number },
    imageUrl?: string
  ): Promise<FloorPlanDto> {
    const form = new FormData();
    form.append("projectId", String(projectId));
    if (imageUrl) form.append("imageUrl", imageUrl);
    if (image) form.append("image", image);
    if (pdf) {
      form.append("pdf", pdf.file);
      form.append("pdfPage", String(pdf.page));
    }
    return authHttp.post<FloorPlanDto>(this.url(), form, UPLOAD_CONFIG);
  }

  // POST /floor-plans (JSON): lưu mặt bằng với URL đã tải sẵn lên Object Storage (ví dụ qua multipart upload)
  async saveImageByUrl(
    projectId: number,
    imageUrl: string,
    pdfUrl?: string,
    pdfPage?: number
  ): Promise<FloorPlanDto> {
    return authHttp.post<FloorPlanDto>(this.url(), { projectId, imageUrl, pdfUrl, pdfPage });
  }

  // POST /floor-plans/{id}/tiles (multipart: version, names[], tiles[]): tải một lô ô ảnh đã cắt sẵn
  async uploadTiles(planId: number, version: string, batch: TileBatch): Promise<void> {
    const form = new FormData();
    form.append("version", version);
    batch.forEach(({ name, blob }) => {
      form.append("names", name);
      form.append("tiles", blob, `${name.replace(/\//g, "-")}.jpg`);
    });
    await authHttp.post(this.url(planId, "tiles"), form, SILENT_UPLOAD);
  }

  // PUT /floor-plans/{id}/tile-set (JSON): chốt bộ ô ảnh
  async saveTileSet(planId: number, info: TileSetInfo): Promise<FloorPlanDto> {
    return authHttp.put<FloorPlanDto>(this.url(planId, "tile-set"), info, SILENT);
  }

  // PUT /floor-plans/{id}/pins?pinScale= (JSON): thay toàn bộ vị trí các căn và kích thước ghim
  async savePins(planId: number, pins: FloorPlanPinInput[], pinScale?: number): Promise<FloorPlanDto> {
    return authHttp.put<FloorPlanDto>(this.url(planId, "pins"), pins, { params: pinScale === undefined ? undefined : { pinScale } });
  }

  // DELETE /floor-plans/{id}
  async remove(planId: number): Promise<void> {
    await authHttp.delete(this.url(planId));
  }

  // ---- Thay mặt bằng bằng PDF theo kiểu giao dịch: tạo nháp → tải ô ảnh vào nháp → chốt (hoặc hủy) ----
  // Trước khi chốt, mặt bằng đang dùng không đổi.

  // POST /floor-plans/drafts (multipart: projectId, pdf, pdfPage hoặc JSON: projectId, pdfUrl, pdfPage)
  async createDraft(
    projectId: number,
    pdf: File | null,
    page: number,
    pdfUrl?: string
  ): Promise<{ draftId: number }> {
    if (pdfUrl) {
      return authHttp.post<{ draftId: number }>(this.url("drafts"), {
        projectId,
        pdfUrl,
        pdfPage: page,
      });
    }
    const form = new FormData();
    form.append("projectId", String(projectId));
    if (pdf) form.append("pdf", pdf);
    form.append("pdfPage", String(page));
    return authHttp.post<{ draftId: number }>(this.url("drafts"), form, UPLOAD_CONFIG);
  }

  // POST /floor-plans/drafts/{draftId}/tiles (multipart: version, names[], tiles[])
  async uploadDraftTiles(draftId: number, version: string, batch: TileBatch): Promise<void> {
    const form = new FormData();
    form.append("version", version);
    batch.forEach(({ name, blob }) => {
      form.append("names", name);
      form.append("tiles", blob, `${name.replace(/\//g, "-")}.jpg`);
    });
    await authHttp.post(this.url("drafts", draftId, "tiles"), form, SILENT_UPLOAD);
  }

  // PUT /floor-plans/drafts/{draftId}/commit (JSON): chốt bản nháp thành mặt bằng của dự án
  async commitDraft(draftId: number, info: TileSetInfo): Promise<FloorPlanDto> {
    return authHttp.put<FloorPlanDto>(this.url("drafts", draftId, "commit"), info, SILENT);
  }

  // DELETE /floor-plans/drafts/{draftId}: hủy bản nháp, xóa file đã tải
  async cancelDraft(draftId: number): Promise<void> {
    await authHttp.delete(this.url("drafts", draftId), SILENT);
  }
}

export const floorPlanService = new FloorPlanService();
