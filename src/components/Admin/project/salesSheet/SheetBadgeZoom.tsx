import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { ZoomAnimEvent } from "leaflet";

// Thu nhỏ hết cỡ thì thẻ vẫn còn thấy được màu quỹ, không teo mất
const MIN_K = 0.2;

/**
 * Cho thẻ giá phóng to / thu nhỏ cùng bảng hàng, như thể in trên bản vẽ.
 * Mốc là zoom 0 (1 px bản vẽ = 1 px màn hình): ở đó thẻ rộng 54px × hệ số "Cỡ", vừa một ô Excel thông thường.
 * Không lấy mốc theo zoom vừa khung, vì bảng hàng rộng thì lúc vừa khung ô rất nhỏ, phóng to vào thẻ sẽ to quá ô.
 * Ghi hệ số vào biến CSS --sheet-k trên khung bản đồ, thẻ (salesSheetBadgeIcon) đọc biến này nên không phải dựng lại icon.
 */
export default function SheetBadgeZoom() {
  const map = useMap();

  useEffect(() => {
    const el = map.getContainer();
    const set = (zoom: number) => el.style.setProperty("--sheet-k", String(Math.max(MIN_K, 2 ** zoom)));
    const onAnim = (e: ZoomAnimEvent) => set(e.zoom); // đổi theo mức zoom đích, CSS transition chạy cùng hiệu ứng zoom của Leaflet
    const onZoom = () => set(map.getZoom());
    set(map.getZoom());
    map.on("zoomanim", onAnim);
    map.on("zoom zoomend", onZoom);
    return () => {
      map.off("zoomanim", onAnim);
      map.off("zoom zoomend", onZoom);
    };
  }, [map]);

  return null;
}
