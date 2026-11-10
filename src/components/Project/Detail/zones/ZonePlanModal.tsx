import { useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import useFocusTrap from "../../../common/useFocusTrap";
import FloorPlanBoard, { type PinUnit } from "../floorPlan/FloorPlanBoard";
import { usePlanSize } from "../floorPlan/planCoords";
import { pinsArea } from "../floorPlan/planPinUnits";
import type { FloorPlanDto } from "../../../../types/project/project.types";

type Props = {
  zoneName: string;
  plan: FloorPlanDto;
  pins: PinUnit[]; // ghim thuộc phân khu
  highRise: boolean;
  onSelect: (id: number) => void; // bấm ghim: căn (thấp tầng) hoặc tòa (cao tầng)
  onClose: () => void;
  selected?: number | null; // căn đang mở chi tiết (ghim phóng to)
  paused?: boolean; // đang mở popup khác phía trên (chi tiết căn / giữ chỗ): nhường Esc và focus
};

// Mặt bằng của một phân khu: cắt đúng vùng bao quanh các căn / tòa đã ghim của phân khu trên mặt bằng tổng
export default function ZonePlanModal({ zoneName, plan, pins, highRise, onSelect, onClose, selected = null, paused = false }: Props) {
  const root = useRef<HTMLDivElement>(null);
  useFocusTrap(root, !paused, onClose);
  const size = usePlanSize(plan);
  const area = useMemo(() => pinsArea(pins), [pins]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink-950/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose} role="presentation">
      <div
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zone-plan-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="animate-page-in flex max-h-[94svh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 md:px-7">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">Mặt bằng phân khu</p>
            <h2 id="zone-plan-title" className="mt-1 truncate text-2xl font-bold text-heading">{zoneName}</h2>
            <p className="mt-1 text-sm text-body">
              {pins.length.toLocaleString("vi-VN")} {highRise ? "tòa nhà" : "căn"} trên mặt bằng
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-heading transition hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-600"
          >
            <X size={18} />
          </button>
        </header>

        {size && size !== "error" && area ? (
          <FloorPlanBoard
            imageUrl={plan.imageUrl}
            width={size.width}
            height={size.height}
            units={pins}
            selected={selected}
            onSelect={onSelect}
            pinScale={plan.pinScale}
            pdfUrl={plan.pdfUrl}
            pdfPage={plan.pdfPage}
            pdfMode={size.mode}
            pdfDensity={size.density}
            pdfTiles={plan.tileBaseUrl && plan.tileLevels != null ? { baseUrl: plan.tileBaseUrl, levels: plan.tileLevels } : undefined}
            focus={area}
            boardHeight="min(72vh, 640px)"
            hint={highRise ? "Bấm vào tòa nhà để xem bảng hàng" : "Giá hiển thị: tỷ VNĐ · Bấm vào ghim để xem căn và giữ chỗ"}
          />
        ) : (
          <div className="flex h-[min(72vh,640px)] items-center justify-center px-6 text-center text-sm text-body">
            {size === "error" ? "Không tải được mặt bằng. Vui lòng thử lại sau." : "Đang tải mặt bằng..."}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
