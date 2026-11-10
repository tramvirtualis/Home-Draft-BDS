import { useEffect, useState } from "react";
import { Browser, TileLayer, latLngBounds, type Coords, type DoneCallback, type LatLng } from "leaflet";
import { useMap, useMapEvents } from "react-leaflet";
import PdfTileLayer from "./PdfTileLayer";
import { openPdfFromUrl } from "../../../../utils/pdfToImage";
import { withTransform } from "../../../../utils/cloudinaryPdf";

type Props = {
  pdfUrl: string;
  page: number;
  width: number; // kích thước hệ toạ độ = raster ở mức nét nhất
  height: number;
  density?: number; // dpi ứng với bề rộng `width` (chế độ dựng ô theo yêu cầu)
  stored?: { baseUrl: string; levels: number }; // bộ ô đã cắt sẵn: {baseUrl}/{mức}/{x}/{y}.jpg
};

// Mỗi ô ảnh 512px chỉ hiển thị 128px: mật độ gấp 4 nên vừa mở ra (chưa zoom) đã nét, kể cả màn hình retina,
// giống cách Salepro dùng mức ảnh cao ngay từ khung nhìn đầu tiên.
const IMG_TILE = 512; // kích thước ô ảnh (khớp TILE trong utils/pdfTiles.ts)
const OVERSAMPLE = 2; // lấy ô ở mức nét hơn 2 bậc so với mức zoom đang hiển thị
const CSS_TILE = IMG_TILE / 2 ** OVERSAMPLE; // 128px
const NATIVE_MAX = -OVERSAMPLE; // mức zoom ứng với ô ảnh nét nhất
// Safari (cả mọi trình duyệt trên iPhone/iPad) giải mã ảnh theo kích thước CSS của ô rồi mới phóng theo transform scale của Leaflet,
// nên ô bị phóng to (zoom lẻ, hoặc zoom vượt mức ảnh nét nhất) bị mờ, trong khi Chrome/Android vẽ lại từ ảnh gốc nên vẫn nét.
// Trên WebKit: chỉ cho ô thu nhỏ (chọn mức ô làm tròn lên) và khi zoom sâu thì phóng ảnh bằng kích thước CSS thay vì transform.
const WEBKIT =
  typeof navigator !== "undefined" &&
  (Browser.safari || /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
const BLANK_TILE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // ô trắng/không có file: để trống thay vì ảnh lỗi

// Lớp ô ảnh: ô cắt sẵn trên VPS / Cloudinary (nhanh nhất) hoặc Cloudinary dựng ô theo yêu cầu từ PDF
class PdfImageTiles extends TileLayer {
  constructor(private readonly src: Props) {
    super("", {
      tileSize: CSS_TILE,
      errorTileUrl: BLANK_TILE,
      bounds: latLngBounds([0, 0], [src.height, src.width]),
      noWrap: true,
      minZoom: -((src.stored?.levels ?? 3) + OVERSAMPLE),
      maxNativeZoom: WEBKIT ? 5 : NATIVE_MAX, // zoom lớn hơn chỉ phóng to ô ở mức nét nhất (vẫn 1 điểm ảnh/pixel)
      maxZoom: 5,
      keepBuffer: 4, // giữ thêm ô quanh màn hình: đã nét thì giữ, chỉ bỏ khi khuất xa
      updateWhenZooming: true, // bắt đầu tải ô mới ngay khi đang zoom, không chờ dừng
      updateInterval: 50,
    });
  }

  // Bản sao GridLayer._setView của Leaflet 1.9, chỉ đổi Math.round thành Math.ceil trên WebKit:
  // mức ô luôn >= mức zoom nên lớp ô chỉ bị thu nhỏ (scale <= 1), không bị phóng to gây mờ.
  _setView(center: LatLng, zoom: number, noPrune?: boolean, noUpdate?: boolean) {
    const self = this as unknown as {
      options: { maxZoom?: number; minZoom?: number; updateWhenZooming?: boolean };
      _tileZoom?: number;
      _abortLoading?: () => void;
      _clampZoom: (z: number) => number;
      _updateLevels: () => void;
      _resetGrid: () => void;
      _update: (c: LatLng) => void;
      _pruneTiles: () => void;
      _noPrune: boolean;
      _setZoomTransforms: (c: LatLng, z: number) => void;
    };
    let tileZoom: number | undefined = WEBKIT ? Math.ceil(zoom - 1e-6) : Math.round(zoom);
    const { maxZoom, minZoom } = self.options;
    if ((maxZoom !== undefined && tileZoom > maxZoom) || (minZoom !== undefined && tileZoom < minZoom)) tileZoom = undefined;
    else tileZoom = self._clampZoom(tileZoom);

    const tileZoomChanged = self.options.updateWhenZooming && tileZoom !== self._tileZoom;
    if (!noUpdate || tileZoomChanged) {
      self._tileZoom = tileZoom;
      self._abortLoading?.();
      self._updateLevels();
      self._resetGrid();
      if (tileZoom !== undefined) self._update(center);
      if (!noPrune) self._pruneTiles();
      self._noPrune = !!noPrune;
    }
    self._setZoomTransforms(center, zoom);
  }

  // Zoom vượt mức ảnh nét nhất (chỉ WebKit): ô là khung cắt một phần ảnh ô cha, ảnh được phóng bằng width/height CSS
  // nên Safari giải mã đủ độ phân giải của ảnh gốc thay vì phóng bản đã thu nhỏ.
  protected createTile(coords: Coords, done: DoneCallback): HTMLElement {
    const d = coords.z - NATIVE_MAX;
    if (d <= 0) return super.createTile(coords, done);
    const f = 2 ** d;
    const px = Math.floor(coords.x / f);
    const py = Math.floor(coords.y / f);
    const parent = Object.assign(coords.clone(), { x: px, y: py, z: NATIVE_MAX }) as Coords;

    const tile = document.createElement("div");
    const img = document.createElement("img");
    img.alt = "";
    img.setAttribute("role", "presentation");
    img.decoding = "async";
    Object.assign(img.style, {
      position: "absolute",
      left: `${-(coords.x - px * f) * CSS_TILE}px`,
      top: `${-(coords.y - py * f) * CSS_TILE}px`,
      width: `${CSS_TILE * f}px`,
      height: `${CSS_TILE * f}px`,
      maxWidth: "none",
    });
    tile.style.overflow = "hidden";
    // Leaflet đọc tile.complete khi hủy tải ô của mức zoom cũ
    Object.defineProperty(tile, "complete", { get: () => img.complete });
    img.onload = () => done(undefined, tile);
    img.onerror = () => {
      img.style.visibility = "hidden"; // ô trắng / không có file
      done(undefined, tile);
    };
    img.src = this.getTileUrl(parent);
    tile.appendChild(img);
    return tile;
  }

  getTileUrl(coords: Coords): string {
    const { pdfUrl, page, width, height, density = 150, stored } = this.src;
    const level = coords.z + OVERSAMPLE; // mức ảnh tương ứng (0 = nguyên bản)
    // Ô đã cắt sẵn trên Cloudinary: mức lưu = mức ảnh + số mức, hàng đếm từ dưới lên
    if (stored) return `${stored.baseUrl}/${level + stored.levels}/${coords.x}/${-coords.y}.jpg`;

    const k = Math.pow(2, level); // tỉ lệ so với raster nguyên bản
    const w = Math.max(1, Math.round(width * k)); // bề rộng raster ở mức này
    const x = coords.x * IMG_TILE;
    // CRS.Simple: hàng pixel của ảnh = chỉ số ô * kích thước ô + chiều cao thế giới ở mức này
    const y = Math.round(coords.y * IMG_TILE + height * k);
    const dn = Math.max(10, Math.round(density * k));
    return withTransform(
      pdfUrl,
      `pg_${page},dn_${dn}/c_scale,w_${w}/c_crop,x_${Math.max(0, x)},y_${Math.max(0, y)},w_${IMG_TILE},h_${IMG_TILE}/f_auto,q_auto`,
    );
  }
}

// Mặt bằng từ PDF: chỉ tải các ô ảnh đang nhìn thấy (lazy), không tải file PDF khi xem bình thường.
// Khi khách zoom vượt hẳn mức ảnh gốc, vùng đang nhìn được vẽ thêm từ PDF vector (nét), các vùng khác giữ ô ảnh.
export default function TiledPdfLayer(props: Props) {
  const map = useMap();
  const { pdfUrl, page, width, height, density, stored } = props;
  const [deep, setDeep] = useState(map.getZoom() > 0.5);
  useMapEvents({ zoomend: () => setDeep(map.getZoom() > 0.5) });

  // Tải sẵn PDF khi trình duyệt rảnh để lúc zoom sâu các ô nét hiện ngay, không phải chờ tải file
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void openPdfFromUrl(pdfUrl).then((doc) => doc.getPage(page)).catch(() => undefined);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [pdfUrl, page]);

  useEffect(() => {
    const layer = new PdfImageTiles({ pdfUrl, page, width, height, density, stored });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, pdfUrl, page, width, height, density, stored?.baseUrl, stored?.levels]);

  // Bộ ô cắt sẵn đã đủ nét: không vẽ thêm từ PDF (chậm, hiện từng mảng); chỉ chế độ dựng ô theo yêu cầu mới cần
  return deep && !stored ? <PdfTileLayer pdfUrl={pdfUrl} page={page} width={width} height={height} maxZoom={5} detailOnly /> : null;
}
