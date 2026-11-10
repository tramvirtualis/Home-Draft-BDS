import BaseService from "../base/BaseService";
import { UPLOAD_CONFIG } from "../project/projectService";
import { store } from "../../store";
import { setAccessToken, setUser } from "../../store/authSlice";
import type {
  AuthResponse,
  AuthUser,
  ChangePasswordRequest,
  UpdateProfileRequest,
} from "../../types/auth/auth.types";
import { uploadImage } from "../upload/uploadService";

// Hồ sơ của chính người đang đăng nhập; xong thì cập nhật luôn store để header / sidebar đổi theo
class ProfileService extends BaseService {
  constructor() {
    super("/users/me");
  }

  // PUT /users/me (form-data: fullName, phone, avatarUrl, removeAvatar) — ảnh upload thẳng lên Object Storage, chỉ gửi link
  async updateProfile({ fullName, phone, avatar, removeAvatar }: UpdateProfileRequest): Promise<AuthUser> {
    const form = new FormData();
    form.append("fullName", fullName.trim());
    form.append("phone", phone.trim());
    if (avatar) form.append("avatarUrl", await uploadImage(avatar, "AVATAR"));
    else if (removeAvatar) form.append("removeAvatar", "true");
    const user = await this.http.put<AuthUser>(this.url(), form, UPLOAD_CONFIG);
    store.dispatch(setUser(user));
    return user;
  }

  // PUT /users/me/password — BE thu hồi mọi phiên rồi cấp phiên mới cho thiết bị này
  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    const res = await this.http.put<AuthResponse>(this.url("password"), payload);
    store.dispatch(setAccessToken(res.token));
    const user = store.getState().auth.user;
    if (user && !user.hasPassword) store.dispatch(setUser({ ...user, hasPassword: true }));
  }
}

const profileService = new ProfileService();
export default profileService;
