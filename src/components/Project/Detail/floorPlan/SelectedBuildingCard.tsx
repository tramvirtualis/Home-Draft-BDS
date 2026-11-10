import { FileSpreadsheet, MousePointerClick } from "lucide-react";
import { UNIT_IMAGE_FALLBACK } from "../../../../data/project/detail/floorPlan";
import type { BuildingDto } from "../../../../types/project/building.types";

type Props = {
  building: BuildingDto | null;
  onOpenSheet: (buildingId: number) => void; // mở bảng hàng của tòa
  emptyText?: string;
};

// Cùng khung với thẻ "Căn đang chọn" bên thấp tầng
const CARD = "rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-[0_24px_50px_-30px_rgba(10,15,26,0.45)] backdrop-blur";

// Thẻ "Tòa đang chọn" cạnh mặt bằng cao tầng: ảnh, phân khu, số tầng, nút mở bảng hàng của tòa
export default function SelectedBuildingCard({ building, onOpenSheet, emptyText = "Bấm vào một tòa trên mặt bằng để xem thông tin." }: Props) {
  if (!building) {
    return (
      <aside className={`${CARD} flex min-h-64 flex-col items-center justify-center text-center lg:sticky lg:top-36 lg:self-start`}>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
          <MousePointerClick size={20} aria-hidden />
        </span>
        <p className="mt-3 max-w-56 text-sm text-body">{emptyText}</p>
      </aside>
    );
  }

  const rows: [string, string][] = [
    ["Phân khu", building.zoneName || "—"],
    ["Số tầng", building.floors ? `${building.floors} tầng` : "—"],
  ];

  return (
    <aside className={`${CARD} lg:sticky lg:top-36 lg:self-start`}>
      <p className="font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-primary-600">Tòa đang chọn</p>
      <p className="heading-display mt-1 truncate text-3xl text-heading">{building.name}</p>
      <img src={building.imageUrl ?? UNIT_IMAGE_FALLBACK} alt={building.name} className="mt-4 w-full object-cover" style={{ height: 180 }} />
      <dl className="mt-4">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-primary-100 py-3 text-sm">
            <dt className="text-body">{k}</dt>
            <dd className="text-right font-medium text-heading">{v}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        onClick={() => onOpenSheet(building.id)}
        className="btn-gloss mt-5 flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-3 font-heading text-[11px] font-bold uppercase tracking-widest text-white"
      >
        <FileSpreadsheet size={14} aria-hidden /> Xem bảng hàng
      </button>
    </aside>
  );
}
