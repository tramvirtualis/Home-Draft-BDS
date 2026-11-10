import BaseService from "../base/BaseService";
import { authHttp } from "../../api/http";
import { UPLOAD_CONFIG } from "../project/projectService";
import type { SocialAd } from "../../types/social/socialAd.types";
import { uploadImage } from "../upload/uploadService";

export interface SocialAdInput {
  title: string;
  linkUrl: string;
  image: File | null; // null: giữ ảnh cũ (chỉ được khi vị trí đã có quảng cáo)
}

// GET /social-ads — khách cũng xem được
class SocialAdService extends BaseService {
  constructor() {
    super("/social-ads", { auth: false });
  }

  list(): Promise<SocialAd[]> {
    return this.getList<SocialAd>();
  }
}

/**
 API quản trị quảng cáo cộng đồng: /api/admin/social-ads (chỉ ADMIN).
 - PUT /{slot} (multipart: title, linkUrl, imageUrl) tạo mới hoặc thay quảng cáo ở vị trí đó.
 - DELETE /{slot} gỡ quảng cáo.
 */
class AdminSocialAdService extends BaseService {
  constructor() {
    super("/admin/social-ads");
  }

  list(): Promise<SocialAd[]> {
    return this.getList<SocialAd>();
  }

  // Ảnh upload thẳng lên Object Storage, chỉ gửi link imageUrl
  async save(slot: number, input: SocialAdInput): Promise<SocialAd> {
    const form = new FormData();
    form.append("title", input.title.trim());
    form.append("linkUrl", input.linkUrl.trim());
    if (input.image) form.append("imageUrl", await uploadImage(input.image, "SOCIAL_AD_IMAGE"));
    return authHttp.put<SocialAd>(this.url(slot), form, UPLOAD_CONFIG);
  }

  remove(slot: number): Promise<void> {
    return this.delete(slot);
  }
}

export const socialAdService = new SocialAdService();
export const adminSocialAdService = new AdminSocialAdService();
