import { useRef } from "react";
import { ExternalLink, ImagePlus, Trash2 } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";
import { useSocialAdSlotForm } from "../../../hooks/social/useSocialAdSlotForm";
import { isExternalLink, isValidAdLink, type SocialAd, type SocialAdSlot } from "../../../types/social/socialAd.types";

type Props = {
  meta: SocialAdSlot;
  ad: SocialAd | null; // null: vị trí đang trống
  onChange: (slot: number, ad: SocialAd | null) => void;
};

const input =
  "h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

// Một vị trí quảng cáo: chọn ảnh, nhập tên dự án + link, lưu hoặc gỡ
export default function SocialAdSlotCard({ meta, ad, onChange }: Props) {
  const picker = useRef<HTMLInputElement>(null);
  const {
    title, setTitle, linkUrl, setLinkUrl, saving, confirmRemove, setConfirmRemove, image, dirty, pickImage, save, remove,
  } = useSocialAdSlotForm(meta, ad, onChange);

  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-6">
        <div>
          <h2 className="text-xl font-bold text-footer">{meta.label}</h2>
          <p className="mt-1 text-sm text-body">{meta.desc}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            ad ? "bg-success/10 text-success" : "bg-line text-body"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${ad ? "bg-success" : "bg-muted"}`} />
          {ad ? "Đang hiển thị" : "Chưa cài quảng cáo"}
        </span>
      </div>

      <form onSubmit={save} noValidate className="grid gap-6 p-6 md:grid-cols-[minmax(0,320px)_1fr]">
        <div>
          <p className="text-sm font-semibold text-footer">
            Ảnh <span className="text-danger">*</span>
          </p>
          <button
            type="button"
            onClick={() => picker.current?.click()}
            disabled={saving}
            className={`group relative mt-1.5 flex w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-primary-300 bg-primary-50/40 text-primary-700 transition hover:bg-primary-50 disabled:opacity-60 ${
              meta.large ? "aspect-[4/5]" : "aspect-[2/1]"
            }`}
          >
            {image ? (
              <>
                <img src={image} alt="Ảnh quảng cáo" className="absolute inset-0 h-full w-full object-cover" />
                <span className="relative rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold opacity-0 shadow transition group-hover:opacity-100">
                  Đổi ảnh
                </span>
              </>
            ) : (
              <span className="flex flex-col items-center gap-1 text-xs font-semibold">
                <ImagePlus size={22} /> Chọn ảnh
              </span>
            )}
          </button>
          <p className="mt-1.5 text-xs text-muted">Tối đa 50 MB. {meta.large ? "Nên dùng ảnh dọc." : "Nên dùng ảnh ngang."}</p>
          <input
            ref={picker}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              pickImage(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        <div className="flex flex-col gap-5">
          <label className="block">
            <span className="text-sm font-semibold text-footer">
              Tên dự án <span className="text-danger">*</span>
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              placeholder="Ví dụ: Vinhomes Grand Park"
              disabled={saving}
              className={`${input} mt-1.5`}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-footer">
              Link <span className="text-danger">*</span>
            </span>
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              maxLength={1000}
              inputMode="url"
              placeholder="https://... hoặc /projects/1"
              disabled={saving}
              className={`${input} mt-1.5`}
            />
            <span className="mt-1.5 block text-xs text-muted">
              Link trang web khác (https://...) sẽ mở tab mới; đường dẫn trong web (bắt đầu bằng /) thì chuyển trang luôn.
            </span>
          </label>

          {ad && isValidAdLink(ad.linkUrl) && (
            <a
              href={ad.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-primary-700 hover:underline"
            >
              <ExternalLink size={13} /> Mở thử link đang lưu{isExternalLink(ad.linkUrl) ? "" : " (trong web)"}
            </a>
          )}

          <div className="mt-auto flex flex-wrap justify-end gap-3 border-t border-line pt-4">
            {ad && (
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                disabled={saving}
                className="mr-auto inline-flex items-center gap-1.5 rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/20 disabled:opacity-60"
              >
                <Trash2 size={15} /> Gỡ quảng cáo
              </button>
            )}
            <button
              disabled={saving || !dirty}
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : ad ? "Lưu thay đổi" : "Cài quảng cáo"}
            </button>
          </div>
        </div>
      </form>

      {confirmRemove && (
        <ConfirmDialog
          title="Gỡ quảng cáo?"
          message={`Quảng cáo "${ad?.title}" sẽ không còn hiện ở trang Cộng đồng. Ảnh cũng bị xóa, muốn hiện lại phải cài lại từ đầu.`}
          confirmLabel="Gỡ quảng cáo"
          busy={saving}
          onConfirm={remove}
          onClose={() => setConfirmRemove(false)}
        />
      )}
    </section>
  );
}
