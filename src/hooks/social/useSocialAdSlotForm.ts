import { useEffect, useState, type FormEvent } from "react";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminSocialAdService } from "../../services/social/socialAdService";
import { isValidAdLink, type SocialAd, type SocialAdSlot } from "../../types/social/socialAd.types";

const MAX_IMAGE_SIZE = 50 * 1024 * 1024;

// Form của một vị trí quảng cáo: chọn ảnh, nhập tên dự án + link, lưu hoặc gỡ
export function useSocialAdSlotForm(meta: SocialAdSlot, ad: SocialAd | null, onChange: (slot: number, ad: SocialAd | null) => void) {
  const toast = useToast();
  const [title, setTitle] = useState(ad?.title ?? "");
  const [linkUrl, setLinkUrl] = useState(ad?.linkUrl ?? "");
  const [file, setFile] = useState<{ file: File; preview: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  // Giải phóng ảnh xem trước (blob) khi đổi ảnh khác hoặc rời trang
  useEffect(() => () => {
    if (file) URL.revokeObjectURL(file.preview);
  }, [file]);

  const image = file?.preview ?? ad?.imageUrl ?? null;
  const dirty = file !== null || title.trim() !== (ad?.title ?? "") || linkUrl.trim() !== (ad?.linkUrl ?? "");

  const pickImage = (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/") || f.size > MAX_IMAGE_SIZE) {
      toast.show("Chỉ nhận file ảnh, tối đa 50 MB", "error");
      return;
    }
    setFile({ file: f, preview: URL.createObjectURL(f) });
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const missing = [!image && "ảnh", !title.trim() && "tên dự án", !linkUrl.trim() && "link"].filter(Boolean);
    if (missing.length > 0) return toast.show(`Vui lòng bổ sung: ${missing.join(", ")}`, "error");
    if (!isValidAdLink(linkUrl.trim())) {
      return toast.show("Link phải bắt đầu bằng https://, http:// hoặc / (trang trong web)", "error");
    }
    setSaving(true);
    try {
      const saved = await adminSocialAdService.save(meta.slot, { title, linkUrl, image: file?.file ?? null });
      toast.show(`Đã lưu quảng cáo ${meta.label.split(" · ")[0].toLowerCase()}`);
      setFile(null);
      setTitle(saved.title);
      setLinkUrl(saved.linkUrl);
      onChange(meta.slot, saved);
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await adminSocialAdService.remove(meta.slot);
      toast.show("Đã gỡ quảng cáo");
      setFile(null);
      setTitle("");
      setLinkUrl("");
      onChange(meta.slot, null);
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
      setConfirmRemove(false);
    }
  };

  return { title, setTitle, linkUrl, setLinkUrl, saving, confirmRemove, setConfirmRemove, image, dirty, pickImage, save, remove };
}
