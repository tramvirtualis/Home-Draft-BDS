import type { FloorPlanDto } from "../../../../types/project/project.types";
import type { ProjectUnit } from "../../../../types/project/projectUnits.types";
import type { PinUnit } from "./FloorPlanBoard";

// Cao tầng: mỗi ghim là một tòa nhà, chữ trên ghim là tên tòa
export function buildingPinUnits(plan: FloorPlanDto): PinUnit[] {
  return plan.pins.flatMap((p) =>
    p.buildingId != null
      ? [{
          id: p.buildingId,
          code: p.buildingName ?? "",
          label: p.buildingName ?? "Tòa",
          title: `Tòa ${p.buildingName ?? ""} · Bấm để xem bảng hàng`,
          fundType: p.fundType,
          x: p.x,
          y: p.y,
        }]
      : [],
  );
}

// Thấp tầng: chỉ các căn đã được admin gán vị trí trên mặt bằng, ghim hiển thị giá (tỷ VNĐ)
export function unitPinUnits(plan: FloorPlanDto, units: ProjectUnit[]): PinUnit[] {
  const byId = new Map(units.map((u) => [u.id, u]));
  return plan.pins.flatMap((p) => {
    const u = p.propertyId != null ? byId.get(p.propertyId) : undefined;
    return u
      ? [{
          id: u.id,
          code: u.code,
          label: u.priceBillion ? u.priceBillion.toFixed(1).replace(".", ",") : "LH",
          fundType: p.fundType,
          status: u.status,
          x: p.x,
          y: p.y,
        }]
      : [];
  });
}

// Vùng (theo % mặt bằng) bao quanh các ghim, chừa lề để ghim không sát mép.
// Phân khu ít ghim vẫn giữ vùng tối thiểu để không phóng quá sâu.
export type PlanArea = { x0: number; y0: number; x1: number; y1: number };

const MIN_SPAN = 10; // % cạnh tối thiểu của vùng
const PAD_RATIO = 0.15; // lề quanh vùng ghim, theo bề rộng vùng
const MIN_PAD = 2; // %

export function pinsArea(pins: { x: number; y: number }[]): PlanArea | null {
  if (pins.length === 0) return null;
  const axis = (vals: number[]): [number, number] => {
    let lo = Math.min(...vals);
    let hi = Math.max(...vals);
    if (hi - lo < MIN_SPAN) {
      const mid = (lo + hi) / 2;
      lo = mid - MIN_SPAN / 2;
      hi = mid + MIN_SPAN / 2;
    }
    const pad = Math.max(MIN_PAD, (hi - lo) * PAD_RATIO);
    return [Math.max(0, lo - pad), Math.min(100, hi + pad)];
  };
  const [x0, x1] = axis(pins.map((p) => p.x));
  const [y0, y1] = axis(pins.map((p) => p.y));
  return { x0, y0, x1, y1 };
}
