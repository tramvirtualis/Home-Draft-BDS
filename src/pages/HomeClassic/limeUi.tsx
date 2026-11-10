import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/* Giao diện "lime" cho /home-classic: xanh rêu đậm + xanh chanh, ảnh đen trắng, nút viên thuốc,
   dòng nhỏ có icon chấm đôi phía trên tiêu đề, huy hiệu chữ xoay tròn. */

export const L = {
  forest: "#1d3a2a", // xanh rêu đậm: thanh trên cùng, băng chữ, khối dịch vụ, nút
  forestSoft: "#264a37",
  lime: "#c4f82a", // xanh chanh: điểm nhấn
  limeHover: "#d4ff52",
  bg: "#ffffff",
  gray: "#f2f3f1", // nền banner
  ink: "#16251d", // chữ tiêu đề
  text: "#4f5b55",
  muted: "#7b8680",
  line: "#e3e6e3",
};

export const FONT = '"Plus Jakarta Sans", "Inter", system-ui, sans-serif';

export function useLimeFonts() {
  useEffect(() => {
    const id = "font-lime";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);
}

export const wrap = "mx-auto w-full max-w-[1180px] px-5 md:px-10";

// Icon chấm đôi: chấm xanh chanh + hình chữ D xanh rêu (dấu hiệu nhận diện của các dòng nhỏ)
export function DotPair({ className = "h-4 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 16" className={className} aria-hidden>
      <circle cx="8" cy="8" r="7" fill={L.lime} />
      <path d="M15 1 H18 A7 7 0 0 1 18 15 H15 Z" fill={L.forest} />
      <path d="M21 1 H23 A7 7 0 0 1 23 15 H21 A7 7 0 0 0 21 1 Z" fill={L.forest} />
    </svg>
  );
}

// Dòng nhỏ trên tiêu đề
export function Eyebrow({ children, light = false, center = false }: { children: ReactNode; light?: boolean; center?: boolean }) {
  return (
    <p className={`flex items-center gap-2.5 text-sm font-medium ${center ? "justify-center" : ""}`} style={{ color: light ? "#ffffff" : L.ink }}>
      <DotPair />
      {children}
    </p>
  );
}

// Nút viên thuốc: "dark" = nền rêu chữ chanh, "light" = nền trắng chữ rêu, "lime" = nền chanh chữ rêu
export function PillButton({
  to,
  href,
  tone = "dark",
  children,
  className = "",
}: {
  to?: string;
  href?: string;
  tone?: "dark" | "light" | "lime";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    dark: "bg-[#1d3a2a] text-[#c4f82a] hover:bg-[#264a37]",
    light: "bg-white text-[#1d3a2a] hover:bg-[#c4f82a]",
    lime: "bg-[#c4f82a] text-[#1d3a2a] hover:bg-[#d4ff52]",
  }[tone];
  const cls = `group/pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c4f82a] ${tones} ${className}`;
  const content = (
    <>
      {children}
      <ArrowRight size={15} className="transition-transform duration-300 group-hover/pill:translate-x-1" />
    </>
  );
  return href ? (
    <a href={href} className={cls}>
      {content}
    </a>
  ) : (
    <Link to={to ?? "/"} className={cls}>
      {content}
    </Link>
  );
}

// Huy hiệu tròn: chữ chạy vòng quanh, giữa là nút chanh có mũi tên
export function SpinBadge({ href, label = "LIÊN HỆ NGAY • HUBTECH • ", className = "" }: { href: string; label?: string; className?: string }) {
  return (
    <a
      href={href}
      aria-label="Liên hệ ngay"
      className={`group relative flex h-24 w-24 items-center justify-center rounded-full shadow-[0_0_0_5px_#ffffff] transition hover:scale-105 ${className}`}
      style={{ background: L.forest }}
    >
      <svg viewBox="0 0 100 100" className="lime-spin absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <path id="lime-badge-circle" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0" />
        </defs>
        <circle cx="50" cy="50" r="46" fill="none" stroke={L.lime} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
        <text fontSize="10.5" fontWeight="700" letterSpacing="2.4" fill="#ffffff">
          <textPath href="#lime-badge-circle">{label}</textPath>
        </text>
      </svg>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full" style={{ background: L.lime, color: L.forest }}>
        <ArrowRight size={16} className="transition-transform group-hover:-rotate-45" />
      </span>
    </a>
  );
}

// Ngôi sao 4 cánh (lấp lánh)
export function Sparkle({ className = "", color = L.lime }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M20 0 C22 13 27 18 40 20 C27 22 22 27 20 40 C18 27 13 22 0 20 C13 18 18 13 20 0 Z" fill={color} />
    </svg>
  );
}

// Theo dõi phần tử đã cuộn tới chưa (một lần); giảm chuyển động thì coi như đã tới
export function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// Hiện dần khi cuộn tới
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
