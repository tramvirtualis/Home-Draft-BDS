import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

// Cắt một trang PDF thành bộ ô ảnh (nhiều mức thu nhỏ) ngay ở trình duyệt để tải lên Cloudinary.
// Đánh số khớp lưới ô của Leaflet CRS.Simple: tên ô = "{mức}/{x}/{y}" với mức = zoom + levels, y đếm từ dưới lên (bắt đầu từ 1).
// Trang được vẽ theo từng đoạn (cao STRIP_ROWS hàng ô, rộng tối đa SEGMENT) nên không cần canvas khổng lồ, dù mặt bằng rất lớn.

const TILE = 512; // khớp IMG_TILE ở lớp hiển thị
// Cạnh dài nguyên bản (px) = 512 x 235: vẫn 8 mức thu nhỏ, nét gấp ~1,22 lần bản 98304 (thời gian cắt ~1,5 lần),
// nên phóng tối đa (MAX_VIEW_SIDE) ảnh gần như không còn bị phóng to.
// Không vượt 140000: giới hạn tileWidth / tileHeight ở BE (FloorPlanTileSetRequest), mức tối đa 8 cũng khớp BE.
const MAX_SIDE = 120320;
const SEGMENT = 15360; // bề rộng mỗi đoạn vẽ (bội số của TILE), nằm trong giới hạn canvas của mọi trình duyệt máy tính
// Mỗi lần render pdf.js phải chạy hết lệnh vẽ của cả trang, nên vẽ nhiều hàng ô một lần cho đỡ số lần render.
// 15360 x 2048 ≈ 31 triệu px (~126MB), vẫn trong giới hạn canvas của trình duyệt máy tính.
const STRIP_ROWS = 4;
const BATCH = 40; // số ô mỗi lần gửi lên máy chủ (khớp giới hạn BE)
const PARALLEL_BATCHES = 2; // số lô gửi cùng lúc
const RETRIES = 3;
const JPEG_QUALITY = 0.9; // nét chữ mã căn / giá rõ hơn, ô nặng hơn ~30% (vẫn xa giới hạn 400KB mỗi ô ở BE)

export type TileSetInfo = { version: string; levels: number; width: number; height: number };
export type TileBatch = { name: string; blob: Blob }[];

// toBlob chụp lại nội dung canvas ngay lúc gọi, nên không cần chờ mã hoá xong mới vẽ ô tiếp theo
const toBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Không mã hoá được ô ảnh"))), "image/jpeg", JPEG_QUALITY),
  );

// pdf.js mặc định vẽ theo từng khung hình (requestAnimationFrame), mà trình duyệt dừng hẳn khung hình khi tab bị ẩn,
// nên chuyển sang tab khác là việc cắt đứng im. Cho pdf.js nhường luồng qua MessageChannel thay thế:
// không bị dừng hay giãn khi tab ẩn, mà giữa các nhịp vẽ giao diện vẫn phản hồi (thanh tiến độ, nút hủy).
const yieldQueue: (() => void)[] = [];
let yieldChannel: MessageChannel | null = null;
function yieldThen(cb: () => void) {
  if (!yieldChannel) {
    yieldChannel = new MessageChannel();
    yieldChannel.port1.onmessage = () => yieldQueue.shift()?.();
  }
  yieldQueue.push(cb);
  yieldChannel.port2.postMessage(null);
}

function renderInBackground(page: PDFPageProxy, params: Parameters<PDFPageProxy["render"]>[0]) {
  const task = page.render(params);
  // Cờ nội bộ của pdf.js (6.x): tắt thì mỗi nhịp vẽ được lên lịch bằng Promise thay vì requestAnimationFrame.
  // Bản pdf.js sau đổi tên cờ thì chỉ quay về cách cũ (vẫn chạy khi tab đang mở).
  const internal = (task as unknown as { _internalRenderTask?: { _useRequestAnimationFrame?: boolean } })._internalRenderTask;
  if (internal && "_useRequestAnimationFrame" in internal) internal._useRequestAnimationFrame = false;
  task.onContinue = (cont: () => void) => yieldThen(cont);
  return task.promise;
}

// Vùng (x, y, w, h) trong ảnh của cả đoạn (bề rộng stride) trắng hoàn toàn (không có nét vẽ nào)
function isBlank(data: Uint8ClampedArray, stride: number, x: number, y: number, w: number, h: number): boolean {
  for (let row = y; row < y + h; row++) {
    const end = (row * stride + x + w) * 4;
    for (let i = (row * stride + x) * 4; i < end; i += 4) {
      if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) return false;
    }
  }
  return true;
}

// Mức zoom tối đa khi xem bộ ô cắt sẵn: giữ độ phóng tối đa như cũ (cạnh dài hiển thị 131072px),
// nên bộ ô cũ 65536px vẫn zoom tới 1 như trước, bộ ô mới nét hơn thì không phóng sâu hơn mà nét hơn ở cùng độ phóng.
const MAX_VIEW_SIDE = 131072;
export const storedMaxZoom = (width: number, height: number) => Math.log2(MAX_VIEW_SIDE / Math.max(width, height, 1));

// Kích thước và số mức của bộ ô cho một trang PDF
export function planTileSet(pageWidth: number, pageHeight: number) {
  const k = MAX_SIDE / Math.max(pageWidth, pageHeight);
  const width = Math.round(pageWidth * k);
  const height = Math.round(pageHeight * k);
  const levels = Math.max(0, Math.ceil(Math.log2(Math.max(width, height) / TILE)));
  return { width, height, levels };
}

export async function buildAndUploadTiles(opts: {
  pdf: PDFDocumentProxy;
  page: number;
  upload: (version: string, batch: TileBatch) => Promise<void>;
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal; // dừng giữa chừng (người dùng bấm hủy)
}): Promise<TileSetInfo> {
  const stopIfAborted = () => {
    if (opts.signal?.aborted) throw new DOMException("Đã hủy", "AbortError");
  };
  const page = await opts.pdf.getPage(opts.page);
  const base = page.getViewport({ scale: 1 });
  const { width, height, levels } = planTileSet(base.width, base.height);
  const version = String(Date.now());

  const dims = (z: number) => ({ lw: Math.max(1, Math.round(width * 2 ** z)), lh: Math.max(1, Math.round(height * 2 ** z)) });
  let total = 0;
  for (let z = -levels; z <= 0; z++) {
    const { lw, lh } = dims(z);
    total += Math.ceil(lw / TILE) * Math.ceil(lh / TILE);
  }

  let done = 0;
  let skipped = 0; // ô trắng hoàn toàn: không cần lưu (vùng trống của bản vẽ)
  let pending: { name: string; blob: Promise<Blob> }[] = [];
  const inflight = new Set<Promise<void>>();
  let failure: unknown = null;
  // Gửi một lô, lỗi mạng thì thử lại vài lần
  const send = async (batch: TileBatch) => {
    for (let attempt = 1; ; attempt++) {
      try {
        stopIfAborted();
        await opts.upload(version, batch);
        return;
      } catch (e) {
        if (attempt >= RETRIES || opts.signal?.aborted) throw e;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  };
  
  const flush = async () => {
    if (pending.length === 0) return;
    const items = pending;
    pending = [];
    const blobs = await Promise.all(items.map((t) => t.blob));
    const batch: TileBatch = items.map((t, i) => ({ name: t.name, blob: blobs[i] }));
    // tối đa vài lô đang gửi, trong lúc đó tiếp tục cắt lô sau
    while (inflight.size >= PARALLEL_BATCHES) await Promise.race(inflight);
    if (failure) throw failure;
    const job: Promise<void> = send(batch)
      .then(() => {
        done += batch.length;
        opts.onProgress?.(done + skipped, total);
      })
      .catch((e: unknown) => {
        failure = e;
      })
      .finally(() => inflight.delete(job));
    inflight.add(job);
  };

  const strip = document.createElement("canvas");
  const sctx = strip.getContext("2d");
  const tile = document.createElement("canvas");
  tile.width = TILE;
  tile.height = TILE;
  const tctx = tile.getContext("2d");
  if (!sctx || !tctx) throw new Error("Trình duyệt không hỗ trợ canvas");

  try {
    for (let z = 0; z >= -levels; z--) {
      const { lw, lh } = dims(z);
      const cols = Math.ceil(lw / TILE);
      const rows = Math.ceil(lh / TILE);
      const scale = (width / base.width) * 2 ** z;
      // Mỗi dải gồm các hàng ô ny0..ny1 (ny1 nằm trên cùng)
      for (let ny0 = 1; ny0 <= rows; ny0 += STRIP_ROWS) {
        const ny1 = Math.min(rows, ny0 + STRIP_ROWS - 1);
        const stripH = (ny1 - ny0 + 1) * TILE;
        const srcY = lh - ny1 * TILE; // hàng pixel của ảnh ứng với mép trên dải (âm ở dải trên cùng)
        // Mỗi dải vẽ theo từng đoạn ngang rồi cắt thành các ô theo hàng và cột
        for (let segX = 0; segX < lw; segX += SEGMENT) {
          stopIfAborted();
          if (failure) throw failure;
          const segW = Math.min(SEGMENT, lw - segX);
          strip.width = segW;
          strip.height = stripH;
          sctx.fillStyle = "#ffffff";
          sctx.fillRect(0, 0, segW, stripH);
          await renderInBackground(page, {
            canvasContext: sctx,
            canvas: strip,
            viewport: page.getViewport({ scale, offsetX: -segX, offsetY: -srcY }),
          });
          // Đọc điểm ảnh một lần cho cả đoạn để dò ô trắng
          const { data } = sctx.getImageData(0, 0, segW, stripH);

          const firstCol = segX / TILE;
          const lastCol = Math.min(cols, (segX + segW) / TILE);
          for (let ny = ny1; ny >= ny0; ny--) {
            const sy = (ny1 - ny) * TILE;
            for (let x = firstCol; x < lastCol; x++) {
              const sx = x * TILE - segX;
              const sw = Math.min(TILE, segW - sx);
              if (isBlank(data, segW, sx, sy, sw, TILE)) {
                skipped += 1;
                continue;
              }
              tctx.fillStyle = "#ffffff";
              tctx.fillRect(0, 0, TILE, TILE);
              tctx.drawImage(strip, sx, sy, sw, TILE, 0, 0, sw, TILE);
              pending.push({ name: `${z + levels}/${x}/${ny}`, blob: toBlob(tile) });
              if (pending.length >= BATCH) await flush();
            }
          }
        }
        opts.onProgress?.(done + skipped, total);
      }
    }
    await flush();
    await Promise.all(inflight);
    if (failure) throw failure;
    stopIfAborted();
  } catch (e) {
    // Dừng giữa chừng (lỗi / hủy): chờ các lô đang gửi xong hẳn để bên gọi dọn bản nháp không sót ô nào
    await Promise.allSettled([...inflight]);
    throw e;
  } finally {
    // Trả bộ nhớ canvas (~126MB) và bộ đệm vẽ của trang ngay, kể cả khi lỗi / hủy
    strip.width = 0;
    strip.height = 0;
    tile.width = 0;
    tile.height = 0;
    page.cleanup();
  }
  // Không có ô nào có nét vẽ: thường do trình duyệt không vẽ được (thiếu bộ nhớ canvas), không lưu bộ ô rỗng
  if (done === 0) throw new Error("Không cắt được ô ảnh nào từ trang PDF");
  return { version, levels, width, height };
}
