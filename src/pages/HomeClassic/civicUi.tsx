import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

/* Giao diện "civic" cho /home-classic: nền xám nhạt, khối xanh lá đậm, ô xanh mint, nút vàng có mũi tên,
   tiêu đề chữ in hoa nét mảnh kèm dòng nhỏ "→ ..." phía trên, mép giấy xé giữa các dải. */

export const C = {
  bg: "#efefec", // nền trang
  white: "#ffffff",
  forest: "#0e5a45", // khối xanh đậm
  forestDeep: "#0a4636",
  green: "#2f9a6a", // chữ nhấn, mũi tên, chấm
  mint: "#8fd0aa", // ô điều hướng
  mintSoft: "#dcf0e3",
  yellow: "#f6d33c", // nút, nền icon
  yellowHover: "#ffe264",
  ink: "#163a30", // chữ tiêu đề
  text: "#3d4b46", // chữ thường
  muted: "#6c7a75",
  line: "#dfe3df",
};

export const FONT = '"Barlow", "Inter", system-ui, sans-serif';

// Tải font Barlow khi mở trang
export function useCivicFonts() {
  useEffect(() => {
    const id = "font-civic";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

export const wrap = "mx-auto w-full max-w-[1180px] px-5 md:px-10";

// Mũi tên dài kiểu "⟶" vẽ bằng SVG cho sắc nét
export function LongArrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 10" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M0 5 H26 M21 1 L26 5 L21 9" />
    </svg>
  );
}

// Huy hiệu icon cạnh tiêu đề: icon nét mảnh đè lên chấm tròn vàng
export function IconBadge({ icon: Icon, light = false }: { icon: LucideIcon; light?: boolean }) {
  return (
    <span className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center" aria-hidden>
      <span className="absolute bottom-0 right-0 h-6 w-6 rounded-full" style={{ background: C.yellow }} />
      <Icon size={26} strokeWidth={1.5} className="relative -translate-x-1 -translate-y-0.5" style={{ color: light ? C.white : C.ink }} />
    </span>
  );
}

// Tiêu đề mục: dòng nhỏ "→ ..." màu xanh, rồi tiêu đề in hoa nét mảnh + huy hiệu icon
export function SectionTitle({
  eyebrow,
  children,
  icon,
  light = false,
  as: Tag = "h2",
}: {
  eyebrow: string;
  children: ReactNode;
  icon?: LucideIcon;
  light?: boolean;
  as?: "h1" | "h2";
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-sm" style={{ color: light ? C.yellow : C.green }}>
        <LongArrow className="h-2 w-3.5" />
        {eyebrow}
      </p>
      <Tag className="mt-1 flex items-center gap-3 text-[32px] font-light uppercase leading-tight tracking-[0.01em] md:text-[40px]" style={{ color: light ? C.white : C.ink }}>
        {children}
        {icon && <IconBadge icon={icon} light={light} />}
      </Tag>
    </div>
  );
}

// Nút vàng: mũi tên dài bên trái + chữ in hoa đậm
const yellowCls =
  "group/btn inline-flex items-center gap-3 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-wide text-[#163a30] shadow-[0_8px_20px_-10px_rgba(246,211,60,0.9)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-12px_rgba(246,211,60,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163a30]";

export function YellowButton({ to, href, children, className = "" }: { to?: string; href?: string; children: ReactNode; className?: string }) {
  const content = (
    <>
      <LongArrow className="h-2.5 w-6 transition-transform duration-300 group-hover/btn:translate-x-1" />
      {children}
    </>
  );
  const style = { background: C.yellow };
  return href ? (
    <a href={href} className={`${yellowCls} ${className}`} style={style}>
      {content}
    </a>
  ) : (
    <Link to={to ?? "/"} className={`${yellowCls} ${className}`} style={style}>
      {content}
    </Link>
  );
}

// Mép lượn mềm giữa hai dải màu (fill = màu của dải phía bên kia), như nét cọ loang
export function TornEdge({ fill, flip = false, className = "" }: { fill: string; flip?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 40"
      preserveAspectRatio="none"
      className={`pointer-events-none block h-5 w-full md:h-8 ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden
    >
      <path fill={fill} d="M0 40 V22 C120 30 210 12 340 16 C470 20 540 34 690 28 C840 22 900 8 1050 12 C1200 16 1290 30 1440 20 V40 Z" />
    </svg>
  );
}

// Hiện dần (mờ thành rõ, trượt nhẹ lên) khi cuộn tới; tắt khi người dùng chọn giảm chuyển động
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
