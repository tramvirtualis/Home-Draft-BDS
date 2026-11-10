import type { BookingUnit } from "../BookingLockModal";
import type { ProjectUnit } from "../../../../types/project/projectUnits.types";
import { STATUS, fmt } from "./inventoryStatus";
import unitPlaceholder from "../../../../assets/images/unit-placeholder.svg";

// Ảnh dùng khi căn chưa có ảnh (thẻ căn, khung giữ chỗ): ảnh nét vẽ tự làm, không dùng ảnh của bên thứ ba
export const UNIT_IMAGE_FALLBACK = unitPlaceholder;

// Chỉ căn còn trống mới cho giữ chỗ
export const canBook = (unit: ProjectUnit) => unit.status === "available";

export function toBookingUnit(unit: ProjectUnit): BookingUnit {
  return {
    code: unit.code,
    image: unit.image ?? UNIT_IMAGE_FALLBACK,
    statusLabel: STATUS[unit.status].label,
    location: `Phân khu ${unit.zone}${unit.floor ? ` · Tầng ${unit.floor}` : ""}`,
    spec: `${unit.type}${unit.area ? ` · ${unit.area} m²` : ""}`,
    direction: unit.direction || "—",
    price: unit.priceBillion ? fmt(unit.priceBillion) : "Liên hệ",
  };
}
