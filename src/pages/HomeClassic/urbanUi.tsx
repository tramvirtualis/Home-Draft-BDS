import { useEffect, type ReactNode } from "react";

// Dùng chung cho trang chủ /home-classic: bảng màu, font, tiêu đề mục, viên thuốc, nhãn, logo chấm

export const P = {
  bg: "#ffffff",
  card: "#f3f7f5",
  blush: "#e3eee7",
  lilac: "#c8ddd0",
  black: "#0f2418", // mực xanh rất đậm thay cho đen
  muted: "rgba(16,16,16,0.6)",
  // Tông xanh lá + trắng kiểu TopCV
  green: "#00b14f", // xanh lá chính: khối màu, vạch, chấm, số, nhãn, icon
  mint: "#e9f9ef", // xanh NHẠT: mảng tô màu (nền ô khi rê chuột)
  neon: "#2fd170",
  dark: "#0a2416", // nền khối xanh đậm
  glow: "#6ee7a0", // xanh sáng trên nền đậm
  gold: "#f5b800", // vàng: nút hành động chính, nổi trên nền xanh
};

// Toàn trang nền xanh đậm: chữ phụ, đường kẻ, mảng nền xen kẽ và thẻ
export const D = {
  page: "#0a2416", // nền trang
  band: "#0e2f1d", // dải nền xen kẽ (sáng hơn nền trang một chút)
  card: "#0a2416", // thẻ đặt trên dải nền
  hover: "#123a24", // thẻ khi rê chuột
  text: "#ffffff",
  muted: "rgba(255,255,255,0.65)",
  line: "rgba(110,231,160,0.18)", // viền / đường kẻ mảnh
};

// Nút hành động chính: nền vàng, chữ xanh đậm (nổi bật trên khối xanh)
export const GOLD_BTN =
  "rounded-full bg-[#f5b800] font-semibold text-[#0a2416] transition hover:bg-[#ffc933] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5b800]";

export const FONT = '"Inter Tight", "Inter", system-ui, sans-serif';
export const MONO = '"JetBrains Mono", ui-monospace, monospace';

// Tải font Inter Tight + JetBrains Mono (chữ số kiểu bảng điện tử) khi mở trang
export function useUrbanFonts() {
  useEffect(() => {
    const id = "font-urban";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

// Tiêu đề mục: chữ thường đậm (như mẫu), phụ đề xanh bên dưới, vạch xanh ngắn + đường kẻ mảnh kéo dài
export function Heading({ children, id, aside, light = false, sub }: { children: ReactNode; id?: string; aside?: ReactNode; light?: boolean; sub?: ReactNode }) {
  return (
    <div id={id} className="flex scroll-mt-24 flex-wrap items-end gap-x-8 gap-y-4">
      <div>
        <h2 className="text-4xl font-semibold leading-[1.08] tracking-[-0.025em] md:text-6xl">{children}</h2>
        {sub && (
          <p className="mt-3 text-sm font-semibold md:text-base" style={{ color: light ? P.glow : P.green }}>
            {sub}
          </p>
        )}
      </div>
      <span className="mb-3 hidden items-center md:flex md:flex-1">
        <span className="h-1.5 w-14 shrink-0 rounded-full" style={{ background: P.green }} />
        <span className="h-px min-w-16 flex-1" style={{ background: light ? "rgba(110,231,160,0.3)" : "rgba(0,177,79,0.35)" }} />
      </span>
      {aside}
    </div>
  );
}

// Viên thuốc: xanh đặc, viền xanh, hoặc mờ trên nền đậm
export function Pill({ children, tone = "solid", className = "" }: { children: ReactNode; tone?: "solid" | "outline" | "glass"; className?: string }) {
  const cls = {
    solid: "bg-[#00b14f] text-[#ffffff]",
    outline: "border border-[#00b14f] text-[#00873c]",
    glass: "border border-[#6ee7a0]/30 bg-[#6ee7a0]/10 text-[#d9fbe6] backdrop-blur",
  }[tone];
  return <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ${cls} ${className}`}>{children}</span>;
}

// Nhãn mục nhỏ màu xanh + vạch kẻ mảnh kéo dài
export function Label({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-semibold lowercase tracking-wide" style={{ color: light ? P.glow : P.green }}>
      <span>{children}</span>
      <span className="h-px flex-1" style={{ background: light ? "rgba(110,231,160,0.3)" : "rgba(0,177,79,0.35)" }} />
    </div>
  );
}

// Biểu tượng Hubtech dựng bằng lưới chấm phát sáng (như khối chữ chấm trong mẫu)
export function DotMark({ className = "" }: { className?: string }) {
  const paths = (
    <>
      <path d="M14 8 V56 M50 8 V56" />
      <path d="M14 42 L32 27 L50 42" />
    </>
  );
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <pattern id="hc-dots" width="1.6" height="1.6" patternUnits="userSpaceOnUse">
          <circle cx="0.8" cy="0.8" r="0.55" fill="#9ff5c0" />
        </pattern>
        <filter id="hc-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>
      <g stroke="#00b14f" strokeWidth="9" opacity="0.55" filter="url(#hc-blur)">{paths}</g>
      <g stroke="url(#hc-dots)" strokeWidth="9">{paths}</g>
      <circle cx="32" cy="12" r="5.5" fill="url(#hc-dots)" />
      <circle cx="32" cy="12" r="6" fill="#00b14f" opacity="0.5" filter="url(#hc-blur)" />
    </svg>
  );
}
